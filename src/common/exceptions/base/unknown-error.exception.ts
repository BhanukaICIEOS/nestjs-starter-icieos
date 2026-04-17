import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../../errors/error-codes';

export class UnknownErrorException extends BaseException {
  constructor(message = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, {
      errorCode: ErrorCodes.UnknownError,
    });
  }
}
