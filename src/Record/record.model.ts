import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../shared/base.model';
import { User } from '../user/user.model';
import { Column, Entity, ManyToOne, RelationId, OneToMany } from 'typeorm';

@Entity()
@ObjectType()
export class Record extends BaseModel {
  @Column()
  @Field((_) => String)
  runType!: string;

  @Column()
  @Field((_) => Number)
  totalDistance!: number;

  @Column()
  @Field((_) => Number)
  totalPace!: number

  @Column()
  @Field((_) => Number)
  consumedCalories: number

  @ManyToOne(
    () => User,
    (user) => user.records,
  )
  @Field((_) => Record)
  runner!: User;

  @OneToMany(
    () => RecordsPerKillometer,
    (recordPerKm) => recordPerKm.finalRecord,
  )
  @Field((_) => [RecordsPerKillometer])
  recordPerKm!: RecordsPerKillometer[];

  @RelationId((record: Record) => record.runner)
  userId: number
}

@Entity()
@ObjectType()
export class RecordsPerKillometer extends BaseModel {
  @Column({ default: 1 })
  @Field((_) => Number)
  distance!: number

  @Column()
  @Field((_) => Date)
  pace: Date

  @Column()
  @Field((_) => Date)
  difference: Date

  @ManyToOne(
    () => Record,
    (record) => record.recordPerKm,
  )
  @Field((_) => Record)
  finalRecord!: Record;

  @RelationId((recordPerKm: RecordsPerKillometer) => recordPerKm.finalRecord)
  recordId: number
}