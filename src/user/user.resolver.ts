import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { User } from "./user.model"
import { CreateUserInput, CreateUserOutput } from "./dtos/user-create.dto"
import { UserService } from "./user.service"
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserOutPut } from 'src/auth/dtos/auth-login.dto';
import { UserProfileInput } from './dtos/user.profile.dto';
import { GqlUser } from 'src/shared/decorator/decorator';
import { CommonOutPut } from 'src/shared/dtos/output.dto';

@Resolver(of => User)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Mutation(returns => CreateUserOutput)
    async createUser(
        @Args('input') createUserInput: CreateUserInput,
    ): Promise<CreateUserOutput> {
        return this.userService.createUser(createUserInput)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => UserOutPut)
    async getMyProfile(
        @GqlUser() user: User
    ): Promise<any> {
        return this.userService.getProfile(user)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => UserOutPut)
    async editMyProfile(
        @Args('input') input: UserProfileInput,
        @GqlUser() user: User
    ): Promise<UserOutPut> {
        return this.userService.editProfile(input, user)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommonOutPut)
    async deleteUser(
        @GqlUser() user: User
    ): Promise<CommonOutPut> {
        return this.userService.deleteUser(user)
    }
}
