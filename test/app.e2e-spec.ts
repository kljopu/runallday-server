/* eslint-disable @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from '../src/app.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { arrayContains } from 'class-validator';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let token: ""

  beforeEach(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UserModule],
      providers: [
        UserService
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('get hello', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{hello}' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.hello).toBe('Hello World!');
      });
  });

  it('user create', () => {
    const name = 'hakhak';
    const email = 'test@gmail.com'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createUser(input:{email: "${email}", password: "hakhak", name: "${name}"})
            { ok, error }}`})
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.createUser.ok).toBe(true);
        expect(body.data.createUser.error).toBe(null)
      });
  });

  it('user create fail - overlap', () => {
    const name = 'hakhak';
    const email = 'test@gmail.com'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createUser(input:{email: "${email}", password: "hakhak", name: "${name}"})
            { ok, error }}`})
      .expect(({ body }) => {
        expect(body.data.createUser.ok).toBe(false);
        expect(body.data.createUser.error).toBe("USER ALREADY EXISTS")
      });
  });

  it('user login', () => {
    const email = 'test@gmail.com'
    const password = 'hakhak'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          login(input:{email: "${email}", password: "${password}"})
            { ok, access_token }}`})
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.login.ok).toBe(true);
        token = body.data.login.access_token
        expect(body.data.login.access_token).toBe(token)
      });
  });

  it('login Faild -wrong password', () => {
    const email = 'test@gmail.com'
    const password = "wrongPass"
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          login(input: {email: "${email}", password: "${password}"}) {
            ok, access_token
          }
        }`
      })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe("PASSWORD NOT MATCHED")
      })
  })

  it('login Faild - user does not exists', () => {
    const email = 'test1@gmail.com'
    const password = "wrongPass"
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          login(input: {email: "${email}", password: "${password}"}) {
            ok, access_token
          }
        }`
      })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe("USER NOT FOUND")
      })
  })

  it('get profile', () => {
    const email = 'test@gmail.com'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  getMyProfile(input: {email: "${email}"}){
                    user {
                      id,
                      email,
                      name
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.getMyProfile.user.email).toBe(email);
      });
  });

  it('get profile - Unauthorized', () => {
    const email = 'test@gmail.com'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  getMyProfile(input: {email: "${email}"}){
                    user {
                      id,
                      email,
                      name
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe("Unauthorized");
      });
  });

  it('create board', () => {
    const board = {
      title: '학학이 소개',
      content: '학학이는 살아있어요',
    };
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {createBoard(input:{title: "hakhak test", content: "board create"})
        {ok}}`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.createBoard.ok).toBe(true);
      });
  });

  it('create board faild -wrong Input', () => {
    const wrongInput = "wrongInput"
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {createBoard(${wrongInput}:{title: "hakhak test", content: "board create"})
        {ok}}`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe(`Unknown argument \"${wrongInput}\" on field \"Mutation.createBoard\". Did you mean \"input\"?`);
      });
  });

  it('boards of user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  getBoards{
                    boards {
                      id,
                      title,
                      content
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.getBoards.boards).toMatchObject([{ "content": "board create", "id": "1", "title": "hakhak test" }]);
      });
  });

  it('boards of user faild - Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  getBoards{
                    boards {
                      id,
                      title,
                      content
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe("Unauthorized");
      });
  });

  it('board get all', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  getAllBoards{
                    boards {
                      id,
                      title,
                      content,
                      author{
                        id
                      }
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.getAllBoards.boards).toMatchObject([{ "content": "board create", "id": "1", "title": "hakhak test", "author": { "id": "1" } }]);
      });
  });

  it('board get all faild - Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  getAllBoards{
                    boards {
                      id,
                      title,
                      content,
                      author{
                        id
                      }
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });

  it('boards edit ', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  editMyBoard(
                    input: {
                      id: 1, title: "edit test", content: "edit success"
                    })
                    {
                    boards {
                      id,
                      title,
                      content
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.editMyBoard.boards).toMatchObject({ "content": "edit success", "id": "1", "title": "edit test" });
      });
  });

  it('boards edit faild - Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  editMyBoard(
                    input: {
                      id: 1, title: "edit test", content: "edit success"
                    })
                    {
                    boards {
                      id,
                      title,
                      content
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });

  it('boards delete', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  deleteMyBoard(boardId: 1){
                    ok
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.deleteMyBoard.ok).toBe(true);
      });
  });

  it('boards delete faild - Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  deleteMyBoard(boardId: 1){
                    ok
                  }
                }`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });

  it('edit profile (only name)', () => {
    const newName = "준수"
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  editMyProfile(input: {name: "${newName}"}){
                    user {
                      id,
                      email,
                      name
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.editMyProfile.user.name).toBe(newName);
      });
  });

  it('edit profile (only email)', () => {
    const newEmail = "test100@naver.com"
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  editMyProfile(input: {email: "${newEmail}"}){
                    user {
                      id,
                      email,
                      name
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.editMyProfile.user.email).toBe(newEmail);
      });
  });

  it('edit profile (name & email)', () => {
    const newName = "hakhak"
    const newEmail = 'test101@gmail.com'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  editMyProfile(input: {name: "${newName}", email: "${newEmail}"}){
                    user {
                      id,
                      email,
                      name
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.editMyProfile.user.name).toBe(newName);
        expect(body.data.editMyProfile.user.email).toBe(newEmail);
      });
  });

  it('edit profile faild - Unauthorized', () => {
    const newName = "hakhak"
    const newEmail = 'test101@gmail.com'
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  editMyProfile(input: {name: "${newName}", email: "${newEmail}"}){
                    user {
                      id,
                      email,
                      name
                    }
                  }
                }`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized')
      });
  });

  it('delete user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  deleteUser{ ok }}`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.deleteUser.ok).toBe(true);
      });
  });

  it('delete user faild -Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  deleteUser{ ok }}`,
      })
      .set({ authorization: `Bearer wrongToken` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });

  it('delete user faild - User not found', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
                  deleteUser{ ok }}`,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe(`USER NOT FOUND ID: 1`);
      });
  });
});
