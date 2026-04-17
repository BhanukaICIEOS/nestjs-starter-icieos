import { UnauthorizedException } from '../../base/unauthorized.exception';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid or expired refresh token');
  }
}
