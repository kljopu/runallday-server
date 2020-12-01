import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class CommonOutPut {
    @Field(type => String, { nullable: true })
    error?: string

    @Field(type => Boolean)
    ok: boolean
}