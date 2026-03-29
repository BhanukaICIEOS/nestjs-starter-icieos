import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../errors/error-codes';

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED, {
      errorCode: ErrorCodes.UnauthorizedError,
    });
  }
}
