import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { BaseException } from '../exceptions/base.exception';

@Catch(BaseException)
export class BaseExceptionFilter implements ExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      ...(exception.extra?.errorCode && { errorCode: exception.extra.errorCode }),
      ...(exception.extra?.errors && { errors: exception.extra.errors }),
    });
  }
}
