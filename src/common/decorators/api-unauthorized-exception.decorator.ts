import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

class UnauthorizedResponseDto {
  statusCode!: number;
  message!: string;
  errorCode!: string;
}

export function ApiUnauthorizedException() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedResponseDto,
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          errorCode: 'UNAUTHORIZED_ERROR',
        },
      },
    }),
  );
}
