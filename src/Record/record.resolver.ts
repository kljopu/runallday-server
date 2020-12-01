import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Record, RecordsPerKillometer } from './record.model';
import { BoardService } from './record.service';
import { UserService } from 'src/user/user.service';
import { RecordDefaultOutput, RecordOutput } from './dtos/record.default.output.dto';
import { BoardCreateInput } from './dtos/record.create.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GqlUser } from 'src/shared/decorator/decorator';
import { CommonOutPut } from 'src/shared/dtos/output.dto';

@Resolver(of => Record)
export class BoardResolver {
    constructor(
        private readonly boadService: BoardService,
        private readonly userService: UserService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordDefaultOutput)
    async createBoard(
        @Args('input') input: BoardCreateInput,
        @GqlUser() user: any
    ): Promise<RecordDefaultOutput> {
        console.log(user);
        const author = await this.userService.findById(user.userId)
        return this.boadService.createBoard(author, input)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordOutput)
    async getAllBoards(): Promise<RecordOutput> {
        { return this.boadService.getAllBoards() }
    }

    // @UseGuards(JwtAuthGuard)
    // @Mutation(returns => RecordDefaultOutput)
    // async editMyBoard(
    //     @Args('input') input: BoardEditInput,
    //     @GqlUser() user: any
    // ): Promise<RecordDefaultOutput> {
    //     return await this.boadService.editMyBoard(user.userId, input)
    // }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommonOutPut)
    async deleteMyBoard(
        @Args('boardId') boardId: number,
        @GqlUser() user: any
    ): Promise<CommonOutPut> {
        return this.boadService.deleteMyBoard(user.userId, boardId)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordOutput)
    async getBoards(
        @GqlUser() user: any
    ): Promise<RecordOutput> {
        console.log(user);
        return this.boadService.getBoards(user.userId)
    }
}