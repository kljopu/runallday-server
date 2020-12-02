import { InputType, Field, ObjectType } from "@nestjs/graphql";

@InputType()
export class RecordCreateInput {
    @Field(type => String)
    runType!: string

    @Field(type => Number)
    goalDistance: number
}