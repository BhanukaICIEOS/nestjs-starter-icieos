import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCodes } from '../errors/error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ServiceUnavailableException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    // Handle JWT TokenExpiredError by checking name (avoids requiring jsonwebtoken package)
    if (
      exception instanceof Error &&
      exception.name === 'TokenExpiredError'
    ) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token expired',
        errorCode: ErrorCodes.UnauthorizedError,
      });
      return;
    }

    // Handle JWT JsonWebTokenError or similar token errors
    if (
      exception instanceof Error &&
      exception.name === 'JsonWebTokenError'
    ) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
        errorCode: ErrorCodes.UnauthorizedError,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status).json(
        typeof exceptionResponse === 'string'
          ? { statusCode: status, message: exceptionResponse }
          : exceptionResponse,
      );
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errorCode: ErrorCodes.UnknownError,
    });
  }
}

