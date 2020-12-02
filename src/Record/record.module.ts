import { Module, forwardRef } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordResolver } from './record.resolver';
import { Record, RecordsPerKillometer } from './record.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([Record, RecordsPerKillometer])],
    providers: [RecordService, RecordResolver],
    exports: [TypeOrmModule],
})
export class RecordModule { }
