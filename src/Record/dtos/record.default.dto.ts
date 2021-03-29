import { ObjectType, Field, InputType, PickType } from "@nestjs/graphql";
import { Record, RecordsPerKillometer } from "../record.model"
import { CommonOutPut } from "src/shared/dtos/output.dto";

@ObjectType()
export class RecordOutput {
    @Field(type => [Record], { nullable: true })
    records: Record[];
}

@ObjectType()
export class RecordDefaultOutput extends CommonOutPut {
    @Field(type => Record, { nullable: true })
    record?: Record
}

@InputType()
export class RecordDefaultInput {
    @Field(type => Number)
    id: number

    @Field(type => Boolean)
    isRunning!: boolean

    @Field(type => Number)
    totalDistance!: number

    @Field(type => String)
    totalPace!: string

    @Field(type => Number)
    consumedCalories!: number

    @Field(type => Number)
    goalDistance!: number

    @Field(type => Date)
    totalTime: Date
}

@InputType()
export class runDetailInput extends PickType(
    RecordsPerKillometer, ['difference', 'pace', 'distance', 'isImproved']) {

    @Field(type => Number)
    distance: number

    @Field(type => String)
    pace: string

    @Field(type => Number)
    difference: number

    @Field(type => Boolean)
    isImproved: boolean

}
