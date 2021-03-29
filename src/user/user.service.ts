import * as nodemailer from 'nodemailer';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dtos/user-create.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user.profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User, Follow } from './user.model';
import { UserOutPut } from 'src/auth/dtos/auth-login.dto';
import { CommonOutPut } from 'src/shared/dtos/output.dto';
import { Verification } from './verification.model';
import { VerifyEmailOutput } from './dtos/verifiy-email.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Follow)
    private readonly follows: Repository<Follow>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly mailerService: MailerService,
  ) {
    console.log('use this repository user', User);
  }
  async createUser({
    name,
    email,
    password,
    profileImage,
  }: CreateUserInput): Promise<CreateUserOutput> {
    try {
      const existingUser = await this.users.findOne({ email });
      if (existingUser) {
        return { ok: false, error: 'USER ALREADY EXISTS' };
      }
      if (profileImage === null) {
        profileImage =
          'https://nuber-s3.s3.ap-northeast-2.amazonaws.com/default-avatar.png';
      }
      const user = await this.users.save(
        this.users.create({ email, password, name, profileImage }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailerService
        .sendMail({
          to: `${email}`,
          from: 'runnalldy.com',
          subject: '',
          template: 'index',
          context: {
            code: `${verification.code}`,
          },
        })
        .then((success) => {
          console.log(success);
        })
        .catch((err) => {
          console.log(err);
        });
      return { ok: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'INTERNAL SERVER ERROR',
        error.message,
      );
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'USER NOT FOUND',
        };
      }
      const isValidate = await user.checkPassword(password);
      if (!isValidate) {
        return {
          ok: false,
          error: 'WRONG PASSWORD',
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: 'LOGIN FAILD',
      };
    }
  }

  async findById(id: number): Promise<User> {
    try {
      const user: User = await this.users.findOneOrFail({ id });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR');
    }
  }

  async findByEmail(email: string): Promise<any> {
    try {
      const user: User = await this.users.findOne(
        { email: email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return { ok: false, error: `USER NOT FOUND EMAIL: ${email}` };
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR');
    }
  }

  //Profile Options
  async getProfile(user: User): Promise<UserOutPut> {
    try {
      return { user };
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR');
    }
  }

  // Profile Update
  async editProfile(data: UserProfileInput, user: User): Promise<UserOutPut> {
    try {
      const { email, name } = data;
      if (email) {
        if (name) {
          user.name = name;
          await this.verifications.save(this.verifications.create({ user }));
        }
        user.email = email;
        await this.verifications.save(this.verifications.create({ user }));
      } else if (name) {
        user.name = name;
      }
      await this.users.save(user);
      return { user };
    } catch (error) {
      throw new InternalServerErrorException('CAN NOT UPDATE PROFILE');
    }
  }

  // User Delete
  async deleteUser(user: User): Promise<CommonOutPut> {
    try {
      if (!user) {
        throw new NotFoundException('USER NOT FOUND');
      }
      this.users.softDelete(user.id);
      return {
        ok: true,
      };
    } catch (error) {
      throw new NotFoundException(`USER NOT FOUND ID: ${user.id}`);
    }
  }

  // Follow User
  async followUser(user, requestingUserId: number): Promise<any> {
    try {
      if (!requestingUserId) {
        throw new BadRequestException('INVALID REQUEST');
      }
      const requestingUser = await this.users.findOne(requestingUserId);
      console.log('to: ', requestingUser.name, 'from: ', user.name);
      if (!requestingUser) {
        console.log('user not found');
      }
      const follow = await this.follows.save(
        this.follows.create({
          fromUserId: user.id,
          toUserId: requestingUserId,
        }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async acceptFollowRequest(user, requestFromUserId): Promise<any> {
    try {
      const requsetFromUser = await this.users.findOne(requestFromUserId);
      const follow = await this.follows.findOne({
        fromUserId: requestFromUserId,
        toUserId: user.id,
      });
      if (follow.toUserId !== user.id) {
        console.log('Unauthorized');
        throw new UnauthorizedException('UNAUTHORIZED REQUEST');
      }
      follow.isAccepted = true;
      this.follows.save(follow).then((r) => {
        console.log(r);
      });
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error.message);
      return {
        ok: false,
        erorr: error.message,
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.isVerified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return {
          ok: true,
        };
      }
      return {
        ok: false,
        error: 'Verification not found.',
      };
    } catch (error) {
      return { ok: false, error: 'Could not verify email' };
    }
  }
}
