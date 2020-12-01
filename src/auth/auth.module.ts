import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LocalStrategy } from "./local.strategy"
import { UserModule } from "../user/user.module"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { jwtConstants } from "./constants"
import { AuthResolver } from "./auth.resolver"
import { JwtStrategy } from "./jwt.strategy"
import { UserService } from "src/user/user.service"
import { JwtAuthGuard } from "./jwt-auth.guard"
import { LocalAuthGuard } from "./local-auth.guard"
import { BoardService } from "src/board/board.service"

@Module({
    imports: [
        UserModule,
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: 'user'
        }),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '7h' }
        })
    ],
    providers: [AuthService,
        LocalStrategy,
        AuthResolver,
        JwtStrategy,
        UserService,
        JwtAuthGuard,
        LocalAuthGuard
    ],
    exports: [AuthService, PassportModule]
})

export class AuthModule { }