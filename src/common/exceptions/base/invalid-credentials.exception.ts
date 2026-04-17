import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../../errors/error-codes';

export class InvalidCredentialsException extends BaseException {
  constructor() {
    super('Wrong Credentials', HttpStatus.UNAUTHORIZED, {
      errorCode: ErrorCodes.InvalidLoginOrPasswordError,
    });
  }
}
