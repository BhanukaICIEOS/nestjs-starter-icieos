import { HttpException, applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

type ExceptionFactory = () => HttpException;

function exceptionToExample(exception: HttpException) {
  const status = exception.getStatus();
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return { statusCode: status, message: response };
  }

  if (response && typeof response === 'object') {
    return { statusCode: status, ...(response as Record<string, unknown>) };
  }

  return { statusCode: status, message: exception.message };
}

export function TemplatedApiException(factory: ExceptionFactory) {
  const exception = factory();
  const status = exception.getStatus();
  const example = exceptionToExample(exception);

  return applyDecorators(
    ApiResponse({
      status,
      description: exception.message,
      schema: { example },
    }),
  );
}

