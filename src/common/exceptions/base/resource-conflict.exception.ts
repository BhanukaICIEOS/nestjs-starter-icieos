import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../../errors/error-codes';

export class ResourceConflictException extends BaseException {
  constructor(resource: string | number) {
    super(`${resource} already exists`, HttpStatus.CONFLICT, {
      errorCode: ErrorCodes.ResourceConflictError,
    });
  }
}
