import { ObjectType, Field, PickType, PartialType } from "@nestjs/graphql";
import { Record, RecordsPerKillometer } from "../record.model"
import { CommonOutPut } from "src/shared/dtos/output.dto";

@ObjectType()
export class RecordOutput {
    @Field(type => [Record], { nullable: true })
    records: Record[];
}

@ObjectType()
export class RecordDefaultOutput extends CommonOutPut {
    @Field(type => Record)
    records?: Record
}