import { applyDecorators } from '@nestjs/common';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';

class UnknownErrorResponseDto {
  statusCode!: number;
  message!: string;
}

export function ApiUnknownErrorException() {
  return applyDecorators(
    ApiInternalServerErrorResponse({
      description: 'Unexpected server error',
      type: UnknownErrorResponseDto,
      schema: {
        example: {
          statusCode: 500,
          message: 'Internal server error',
        },
      },
    }),
  );
}

