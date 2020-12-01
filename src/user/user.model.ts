import bcrypt from "bcrypt"
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Record } from '../Record/record.model';
import { BaseModel } from '../shared/base.model';
import { Column, Entity, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, IsString } from "class-validator"
import { InternalServerErrorException } from "@nestjs/common";

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends BaseModel {
  @Column()
  @Field((_) => String)
  name!: string;

  @Column({ default: 0 })
  @Field((_) => Number)
  phoneNumber: number

  @Column({ default: false })
  @Field(type => Boolean)
  isVerified: boolean

  @Column({ unique: true })
  @Field(type => String)
  @IsEmail()
  email!: string

  @Column({ default: null })
  @Field(type => String)
  profileImage: string

  @Column()
  @Field(type => String)
  @IsString()
  password: string

  @OneToMany(
    () => Record,
    (record) => record.runner,
  )
  @Field((_) => [Record])
  records: Record[];

  @BeforeInsert()
  @BeforeUpdate()
  async savePassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10)
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException()
      }
    }
  }
  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password)
      return ok
    } catch (error) {
      console.log("err", error);
      throw new InternalServerErrorException()
    }
  }
}
