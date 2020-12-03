import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Record, RecordsPerKillometer } from './record.model';
import { RecordService } from './record.service';
import { UserService } from 'src/user/user.service';
import { RecordDefaultOutput, RecordOutput, RecordDefaultInput, runDetailInput } from './dtos/record.default.dto';
import { RecordCreateInput } from './dtos/record.create.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GqlUser } from 'src/shared/decorator/decorator';
import { CommonOutPut } from 'src/shared/dtos/output.dto';
import { User } from 'src/user/user.model';

@Resolver(of => Record)
export class RecordResolver {
    constructor(
        private readonly recordService: RecordService,
        private readonly userService: UserService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordDefaultOutput)
    async startRunning(
        @Args('input') input: RecordCreateInput,
        @GqlUser() user: any
    ): Promise<RecordDefaultOutput> {
        console.log(user);
        return this.recordService.runStart(user, input)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordDefaultOutput)
    async stopRunning(
        @Args('input') input: RecordDefaultInput,
        @Args({ name: 'runDetails', type: () => [runDetailInput] }) runDetails: runDetailInput[],
        @GqlUser() user: User
    ): Promise<RecordDefaultOutput> {
        return this.recordService.stopRunning(user, input, runDetails)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordOutput)
    async getAllRecords(
        @GqlUser() user: User
    ): Promise<RecordOutput> {
        return this.recordService.allRecord(user)
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => CommonOutPut)
    async deleteRecord(
        @Args('id') id: number,
        @GqlUser() user: User
    ): Promise<CommonOutPut> {
        return this.recordService.deleteRecord(user, id)
    }
}