import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt"
import { isError } from "util";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        try {
            const user = await this.userService.findByEmail(email)
            if (user.ok == false) {
                throw new NotFoundException('USER NOT FOUND')
            } else {
                const isValidate = await user.checkPassword(password)
                if (!isValidate) {
                    throw new BadRequestException('PASSWORD NOT MATCHED')
                }
                // return user
                const payload = { userId: user.id }
                return {
                    ok: true,
                    access_token: this.jwtService.sign(payload)
                }
            }
        } catch (error) {
            console.log(error.message);
            throw new InternalServerErrorException(error.message)
        }
    }
}
