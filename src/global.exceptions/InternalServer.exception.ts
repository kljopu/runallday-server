import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalServerException extends HttpException {
  constructor() {
    super('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
