import { Injectable, Inject, forwardRef, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record, RecordsPerKillometer } from './record.model';
import { BoardCreateInput } from './dtos/record.create.dto';
import { RecordDefaultOutput, RecordOutput } from './dtos/record.default.output.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.model';
import { CommonOutPut } from 'src/shared/dtos/output.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Record) private readonly records: Repository<Record>,
    @InjectRepository(RecordsPerKillometer) private readonly recordPerkms: Repository<RecordsPerKillometer>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService
  ) {
    console.log('use this repository Record', Record);
  }

  async createBoard(runner: User, data: BoardCreateInput): Promise<BoardDefaultOutput> {
    try {
      const { title, content } = data
      if (!runner) {
        throw new NotFoundException(`USER DOES NOT EXITST`)
      }
      const boards: Record = await this.records.save(
        this.records.create({
          title: title,
          content: content,
          author: author
        })
      )
      return {
        ok: true,
      }
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR')
    }
  }

  async getAllBoards(): Promise<BoardOutput> {
    try {
      const boards = await this.boards.find({ relations: ['author'] })
      return { boards }
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR')
    }
  }

  // async editMyBoard(userId: number, input: BoardEditInput): Promise<BoardDefaultOutput> {
  //   try {
  //     const { id, title, content } = input
  //     const user = await this.userService.findById(userId)
  //     const board = await this.boards.findOne({ id: id, author: user }, { relations: ['author'] })
  //     if (!board) {
  //       throw new NotFoundException(`NOT FOUND BOARD AT id: ${id}`)
  //     }
  //     board.title = title
  //     board.content = content
  //     this.boards.save(board)
  //     return {
  //       ok: true,
  //       boards: board
  //     }
  //   } catch (error) {
  //     throw new InternalServerErrorException('INTERNAL SERVER ERROR')
  //   }
  // }

  async deleteMyBoard(userId: number, boardId: number): Promise<CommonOutPut> {
    try {
      const user = await this.userService.findById(userId)
      const board = await this.boards.findOne({ id: boardId, author: user }, { relations: ['author'] })
      if (!board) {
        throw new NotFoundException(`NOT FOUND BOARD AT id: ${boardId}`)
      }
      this.boards.softDelete(board.id)
      return {
        ok: true
      }
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR')
    }
  }

  async getBoards(userId: number): Promise<BoardOutput> {
    try {
      const user = await this.userService.findById(userId)
      const boards = await this.boards.find({ author: user })
      if (!boards) {
        throw new NotFoundException(`BOARDS NOT FOUND FOR AUTHOR ${user.id}`)
      }
      return { boards }
    } catch (error) {
      throw new InternalServerErrorException('INTERNAL SERVER ERROR')
    }
  }
}
