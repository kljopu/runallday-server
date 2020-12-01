import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email)
        if (user.ok == false) {
            throw new NotFoundException('USER NOT FOUND')
        } else {
            const isValidate = await user.checkPassword(password)
            if (!isValidate) {
                throw new BadRequestException('PASSWORD NOT MATCHED')
            }
            return user
        }
    }

    async login(user: any) {
        try {
            if (!user) {
                return new UnauthorizedException("UNAUTHORIZED")
            }
            const payload = { userId: user.id }
            console.log("login payload", payload);
            return {
                ok: true,
                access_token: this.jwtService.sign(payload)
            }
        } catch (error) {
            throw new UnauthorizedException()
        }
    }
}
