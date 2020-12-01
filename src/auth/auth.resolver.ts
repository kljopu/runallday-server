import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { AuthLoginInput, AuthLoginOutput } from "./dtos/auth-login.dto"
import { AuthService } from "./auth.service"
import { UseGuards } from "@nestjs/common"
import { LocalAuthGuard } from "./local-auth.guard"

@Resolver()
export class AuthResolver {
    constructor(private readonly service: AuthService) { }

    @UseGuards()
    @Mutation(returns => AuthLoginOutput)
    async login(@Args('input') input: AuthLoginInput): Promise<any> {
        const { email, password } = input
        const user = await this.service.validateUser(email, password)
        return this.service.login(user)
    }
}