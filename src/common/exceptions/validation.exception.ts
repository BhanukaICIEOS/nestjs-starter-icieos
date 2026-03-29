import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../errors/error-codes';

export class ValidationException extends BaseException {
  constructor(errors: any) {
    super('Validation failed', HttpStatus.BAD_REQUEST, {
      errorCode: ErrorCodes.ValidationError,
      errors,
    });
  }
}
