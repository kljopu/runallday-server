import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User } from './user.model';
import { CreateUserInput, CreateUserOutput } from './dtos/user-create.dto';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserOutPut } from 'src/auth/dtos/auth-login.dto';
import { UserProfileInput } from './dtos/user.profile.dto';
import { GqlUser } from 'src/shared/decorator/decorator';
import { CommonOutPut } from 'src/shared/dtos/output.dto';
import { VerifyEmailOutput, VerifyEmailInput } from './dtos/verifiy-email.dto';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation((returns) => CreateUserOutput)
  async createUser(
    @Args('input') createUserInput: CreateUserInput,
  ): Promise<CreateUserOutput> {
    return this.userService.createUser(createUserInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query((returns) => User)
  getMyProfile(@GqlUser() user: User) {
    // return this.userService.getProfile(user)
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => UserOutPut)
  async editMyProfile(
    @Args('input') input: UserProfileInput,
    @GqlUser() user: User,
  ): Promise<UserOutPut> {
    return this.userService.editProfile(input, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => CommonOutPut)
  async deleteUser(@GqlUser() user: User): Promise<CommonOutPut> {
    return this.userService.deleteUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => CommonOutPut)
  async followRequesting(
    @GqlUser() user: User,
    @Args('input') input: number,
  ): Promise<CommonOutPut> {
    return this.userService.followUser(user, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => CommonOutPut)
  async followAccepting(
    @GqlUser() user: User,
    @Args('input') input: number,
  ): Promise<CommonOutPut> {
    return this.userService.acceptFollowRequest(user, input);
  }

  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput) {
    return this.userService.verifyEmail(verifyEmailInput.code);
  }
}
