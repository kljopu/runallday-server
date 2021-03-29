import { InputType, ObjectType, Field } from "@nestjs/graphql";
import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from "typeorm";
import { BaseModel } from "src/shared/base.model";
import { User } from "./user.model";
import { v4 as uuid } from "uuid"

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends BaseModel {
    @Column()
    @Field(type => String)
    code: string;

    @OneToOne(type => User, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;

    @BeforeInsert()
    createCode(): void {
        this.code = uuid()
    }
}