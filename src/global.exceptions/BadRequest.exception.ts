import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(message?) {
    if (!message) {
      super('BAD REQUEST', HttpStatus.BAD_REQUEST);
    }
    super(message, HttpStatus.BAD_REQUEST);
  }
}
