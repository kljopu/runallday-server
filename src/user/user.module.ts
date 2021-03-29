import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Follow } from './user.model';
import { Verification } from './verification.model';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification]),
    TypeOrmModule.forFeature([Follow])
  ],
  providers: [UserService, UserResolver],
  exports: [TypeOrmModule, UserService],
})
export class UserModule { }
