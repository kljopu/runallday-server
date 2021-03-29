import { Resolver, Mutation, Args, Subscription } from '@nestjs/graphql';
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
import { PubSub } from 'graphql-subscriptions'


const pubsub = new PubSub()
@Resolver(of => Record)
export class RecordResolver {
    constructor(
        // private pubsub: PubSub,
        private readonly recordService: RecordService,
        private readonly userService: UserService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => RecordDefaultOutput)
    async startRunning(
        @Args('input') input: RecordCreateInput,
        @GqlUser() user: any
    ): Promise<RecordDefaultOutput> {
        const newRun = await this.recordService.runStart(user, input)
        const runner = newRun.record.runner
        await pubsub.publish('friendStartsRun', {
            friendStartsRun: runner
        })
        return newRun
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

    // {
    // filter: (
    //     {userId: User.}
    // ) => {
    //     return any
    // }}

    // @Subscription(returns => User, { name: 'startRun' })
    // friendStartsRun(
    //     @Args('input') input: RecordCreateInput,
    //     @GqlUser() user: User
    // ) {
    //     return pubsub.asyncIterator('startRun')
    // }

    @Subscription(returns => User, {
        name: 'friendStartsRun'
    })
    addFriendStartsRunHandler() {
        return pubsub.asyncIterator('friendStartsRun')
    }
}                