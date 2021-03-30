import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor() {
    super('NOT FOUND', HttpStatus.NOT_FOUND);
  }
}
