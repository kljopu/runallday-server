// import { Module, forwardRef } from '@nestjs/common';
// import { BoardService } from './record.service';
// import { BoardResolver } from './record.resolver';
// import { Record, RecordsPerKillometer } from './record.model';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserService } from 'src/user/user.service';
// import { UserModule } from 'src/user/user.module';

// @Module({
//   imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([Record, RecordsPerKillometer])],
//   providers: [BoardService, BoardResolver],
//   exports: [TypeOrmModule],
// })
// export class BoardModule { }
