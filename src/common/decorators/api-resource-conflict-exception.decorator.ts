import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse } from '@nestjs/swagger';

class ResourceConflictResponseDto {
	statusCode!: number;
	message!: string;
	error!: string;
}

export function ApiResourceConflictException() {
	return applyDecorators(
		ApiConflictResponse({
			description: 'Resource conflict',
			type: ResourceConflictResponseDto,
			schema: {
				example: {
					statusCode: 409,
					message: 'Resource already exists',
					error: 'Conflict',
				},
			},
		}),
	);
}
