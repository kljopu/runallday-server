import { Injectable, Inject, forwardRef, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record, RecordsPerKillometer } from './record.model';
import { RecordCreateInput } from './dtos/record.create.dto';
import { RecordDefaultOutput, RecordDefaultInput } from './dtos/record.default.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.model';
import { CommonOutPut } from 'src/shared/dtos/output.dto';

@Injectable()
export class RecordService {
  constructor(
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
      console.log(data);
      console.log(runner);

      const {
        id,
        isRunning,
        goalDistance,
        totalDistance,
        consumedCalories,
        totalPace,
        totalTime } = data

      // find current running
      const record = await this.records.findOne({ id: id, runner: runner }, { relations: ['runner', 'recordPerKm'] })
      if (!record) {
        throw new NotFoundException()
      }

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
        // record.recordPerKm = recordPerKm
      })
      console.log("here");
      record.isRunning = isRunning
      record.goalDistance = goalDistance
      record.totalDistance = totalDistance
      record.consumedCalories = consumedCalories
      record.totalPace = totalPace
      record.totalTime = totalTime
      this.records.save(record)

      console.log(record);
      return {
        ok: true,
        record
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('INTERNAL SERVER EXEPTION', error.message)
    }
  }
  //   async createBoard(runner: User, data: BoardCreateInput): Promise<BoardDefaultOutput> {
  //     try {
  //       const { title, content } = data
  //       if (!runner) {
  //         throw new NotFoundException(`USER DOES NOT EXITST`)
  //       }
  //       const boards: Record = await this.records.save(
  //         this.records.create({
  //           title: title,
  //           content: content,
  //           author: author
  //         })
  //       )
  //       return {
  //         ok: true,
  //       }
  //     } catch (error) {
  //       throw new InternalServerErrorException('INTERNAL SERVER ERROR')
  //     }
  //   }

  //   async getAllBoards(): Promise<BoardOutput> {
  //     try {
  //       const boards = await this.boards.find({ relations: ['author'] })
  //       return { boards }
  //     } catch (error) {
  //       throw new InternalServerErrorException('INTERNAL SERVER ERROR')
  //     }
  //   }

  //   // async editMyBoard(userId: number, input: BoardEditInput): Promise<BoardDefaultOutput> {
  //   //   try {
  //   //     const { id, title, content } = input
  //   //     const user = await this.userService.findById(userId)
  //   //     const board = await this.boards.findOne({ id: id, author: user }, { relations: ['author'] })
  //   //     if (!board) {
  //   //       throw new NotFoundException(`NOT FOUND BOARD AT id: ${id}`)
  //   //     }
  //   //     board.title = title
  //   //     board.content = content
  //   //     this.boards.save(board)
  //   //     return {
  //   //       ok: true,
  //   //       boards: board
  //   //     }
  //   //   } catch (error) {
  //   //     throw new InternalServerErrorException('INTERNAL SERVER ERROR')
  //   //   }
  //   // }

  //   async deleteMyBoard(userId: number, boardId: number): Promise<CommonOutPut> {
  //     try {
  //       const user = await this.userService.findById(userId)
  //       const board = await this.boards.findOne({ id: boardId, author: user }, { relations: ['author'] })
  //       if (!board) {
  //         throw new NotFoundException(`NOT FOUND BOARD AT id: ${boardId}`)
  //       }
  //       this.boards.softDelete(board.id)
  //       return {
  //         ok: true
  //       }
  //     } catch (error) {
  //       throw new InternalServerErrorException('INTERNAL SERVER ERROR')
  //     }
  //   }

  //   async getBoards(userId: number): Promise<BoardOutput> {
  //     try {
  //       const user = await this.userService.findById(userId)
  //       const boards = await this.boards.find({ author: user })
  //       if (!boards) {
  //         throw new NotFoundException(`BOARDS NOT FOUND FOR AUTHOR ${user.id}`)
  //       }
  //       return { boards }
  //     } catch (error) {
  //       throw new InternalServerErrorException('INTERNAL SERVER ERROR')
  //     }
  //   }
}
