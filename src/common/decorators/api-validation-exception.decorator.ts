import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

class ValidationErrorResponseDto {
  statusCode!: number;
  message!: string[];
  error!: string;
}

export function ApiValidationException() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Validation failed',
      type: ValidationErrorResponseDto,
      schema: {
        example: {
          statusCode: 400,
          message: ['email must be an email', 'password must be longer than 7 characters'],
          error: 'Bad Request',
        },
      },
    }),
  );
}

