import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

class NotFoundResponseDto {
  statusCode!: number;
  message!: string;
  errorCode!: string;
}

export function ApiNotFoundException() {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Resource not found',
      type: NotFoundResponseDto,
      schema: {
        example: {
          statusCode: 404,
          message: 'Resource not found',
          errorCode: 'NOT_FOUND_ERROR',
        },
      },
    }),
  );
}
