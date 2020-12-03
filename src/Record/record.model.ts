import { Field, ObjectType, Float } from '@nestjs/graphql';
import { BaseModel } from '../shared/base.model';
import { User } from '../user/user.model';
import { Column, Entity, ManyToOne, RelationId, OneToMany, Double } from 'typeorm';

@Entity()
@ObjectType()
export class Record extends BaseModel {
  @Column()
  @Field((_) => String)
  runType!: string;

  @Column({ default: false })
  @Field((_) => Boolean)
  isRunning: boolean

  @Column({ default: 0 })
  @Field((_) => Number)
  goalDistance: number

  @Column({ default: 0, type: "float4" })
  @Field((_) => Number)
  totalDistance!: number;

  // String으로 고쳐야됨
  @Column({ default: 0 })
  @Field((_) => String)
  totalPace!: string

  @Column({ nullable: true })
  @Field((_) => Date)
  totalTime: Date

  @Column({ default: 0 })
  @Field((_) => Number)
  consumedCalories: number

  @ManyToOne(
    () => User,
    (user) => user.records,
  )
  @Field((_) => User)
  runner!: User;

  @OneToMany(
    () => RecordsPerKillometer,
    (recordPerKm) => recordPerKm.finalRecord,
    { cascade: true }
  )
  @Field((_) => [RecordsPerKillometer])
  recordPerKm!: RecordsPerKillometer[];

  @RelationId((record: Record) => record.runner)
  userId: number
}

@Entity()
@ObjectType()
export class RecordsPerKillometer extends BaseModel {
  @Column({ default: 0, type: "float4" })
  @Field((_) => Number)
  distance!: number

  @Column()
  @Field((_) => String)
  pace: string

  @Column({ default: 0, type: "float4" })
  @Field((_) => Number)
  difference: number

  @Column({ default: true })
  @Field((_) => Boolean)
  isImproved: boolean

  @ManyToOne(
    () => Record,
    (record) => record.recordPerKm,
  )
  @Field((_) => Record)
  finalRecord!: Record;

  @RelationId((recordPerKm: RecordsPerKillometer) => recordPerKm.finalRecord)
  recordId: number
}