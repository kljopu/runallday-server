import { ObjectType, InputType, PickType } from "@nestjs/graphql"
import { CommonOutPut } from "../../shared/dtos/output.dto"
import { User } from "../user.model"

@InputType()
export class CreateUserInput extends PickType(User, ['email', 'password', 'name']) { }

@ObjectType()
export class CreateUserOutput extends CommonOutPut { }