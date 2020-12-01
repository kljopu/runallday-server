import { InputType, Field, PickType, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/user.model"
import { CommonOutPut } from "src/shared/dtos/output.dto";

@InputType()
export class AuthLoginInput extends PickType(User, ['email', 'password']) { }

@ObjectType()
export class AuthLoginOutput extends CommonOutPut {
    @Field(type => String, { nullable: true })
    access_token?: string
}

@ObjectType()
export class UserOutPut {
    @Field(type => User, { nullable: true })
    user: User
}