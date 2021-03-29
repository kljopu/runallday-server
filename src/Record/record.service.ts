import { Injectable, Inject, forwardRef, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record, RecordsPerKillometer } from './record.model';
import { RecordCreateInput } from './dtos/record.create.dto';
import { RecordDefaultOutput, RecordDefaultInput, RecordOutput } from './dtos/record.default.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.model';
import { CommonOutPut } from 'src/shared/dtos/output.dto';
import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

@Injectable()
export class RecordService {
  constructor(
    // private pubsub: PubSub,
    @InjectRepository(Record) private readonly records: Repository<Record>,
    @InjectRepository(RecordsPerKillometer) private readonly recordPerkms: Repository<RecordsPerKillometer>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService
  ) {
    console.log('use this repository Record', Record);
  }

  async runStart(runner: User, data: RecordCreateInput): Promise<RecordDefaultOutput> {
    try {
      const { runType, goalDistance } = data
      const record: Record = await this.records.save(
        this.records.create({
          isRunning: true,
          runType: runType,
          goalDistance: goalDistance,
          runner
        })
      )
      console.log(record);
      await pubsub.publish('friendStartsRun', {
        friendStartsRun: runner
      })
      return {
        ok: true,
        record
      }

    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER EXEPTION', error.message)
    }
  }

  async stopRunning(runner: User, data: RecordDefaultInput, detailInput): Promise<RecordDefaultOutput> {
    try {
      const {
        id,
        isRunning,
        goalDistance,
        totalDistance,
        consumedCalories,
        totalPace,
        totalTime } = data

      /* validate input */
      // running is not finished exception
      if (isRunning === false) {
        throw new BadRequestException('RUNNING IS NOT FINISHED')
      }

      // if "Distance" runtype, totalDistance != goalDistance
      if (goalDistance != totalDistance) {
        throw new BadRequestException('CHECK DISTANCE')
      }

      // find current running
      const record = await this.records.findOne({ id: id, runner: runner }, { relations: ['recordPerKm'] })
      if (record === undefined) {
        throw new NotFoundException()
      }

      // record detail create
      detailInput.forEach(async (row, rowIndex) => {
        const pace = row['pace']
        const distance = row['distance']
        const difference = row['difference']
        const isImproved = row['isImproved']

        const recordPerKm = await this.recordPerkms.save(
          this.recordPerkms.create({
            distance: distance,
            difference: difference,
            pace: pace,
            isImproved: isImproved,
            finalRecord: record,
          })
        )
      })

      record.isRunning = false
      record.goalDistance = goalDistance
      record.totalDistance = totalDistance
      record.consumedCalories = consumedCalories
      record.totalPace = totalPace
      record.totalTime = totalTime
      this.records.save(record)

      return {
        ok: true,
        record
      }
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        record: null,
        error: error.response.message
      }
    }
  }

  // redis 
  async allRecord(runner: User): Promise<RecordOutput> {
    try {
      const records = await this.records.find({ runner: runner })
      console.log(records);
      return { records }
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR')
    }
  }

  async deleteRecord(runner: User, id: number): Promise<CommonOutPut> {
    try {

      const record = await this.records.findOne({ id: id, runner: runner }, { relations: ["runner"] })
      this.records.delete(record.id)

      return {
        ok: true
      }
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR')
    }
  }
}