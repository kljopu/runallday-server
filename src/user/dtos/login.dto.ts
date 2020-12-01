import { Field, InputType, ObjectType, PickType, } from '@nestjs/graphql'
import { CommonOutPut } from "../../shared/dtos/output.dto"
import { User } from "../user.model"

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) { }

@ObjectType()
export class LoginOutput extends CommonOutPut {
    @Field(type => String, { nullable: true })
    token?: string
}
