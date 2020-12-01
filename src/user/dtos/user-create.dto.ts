import { ObjectType, InputType, PickType, Field } from "@nestjs/graphql"
import { CommonOutPut } from "../../shared/dtos/output.dto"
import { User } from "../user.model"

// @InputType()
// export class CreateUserInput extends PickType(User, ['email', 'password', 'name', 'profileImage']) { }

@InputType()
export class CreateUserInput {
    @Field(type => String)
    name!: string

    @Field(type => String)
    email!: string

    @Field(type => String)
    password!: string

    @Field(type => String, { nullable: true })
    profileImage: string

}

@ObjectType()
export class CreateUserOutput extends CommonOutPut { }