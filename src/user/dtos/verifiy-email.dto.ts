import { CommonOutPut } from "src/shared/dtos/output.dto";
import { ObjectType, PickType, InputType } from "@nestjs/graphql";
import { Verification } from "../verification.model";

@ObjectType()
export class VerifyEmailOutput extends CommonOutPut {

}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) { }