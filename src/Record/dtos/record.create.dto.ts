import { InputType, Field, ObjectType } from "@nestjs/graphql";

@InputType()
export class BoardCreateInput {
    @Field(type => String)
    title!: string

    @Field(type => String)
    content!: string
}