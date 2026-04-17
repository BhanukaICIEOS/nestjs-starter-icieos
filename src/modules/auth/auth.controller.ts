import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto, AuthResponseDto, RefreshTokenDto } from './dtos';
import { MessageDto } from '../../common/dtos/message.dto';
import { ApiUnauthorizedException } from '../../common/decorators/api-unauthorized-exception.decorator';
import { ApiResourceConflictException } from '../../common/decorators/api-resource-conflict-exception.decorator';
import { ApiValidationException } from '../../common/decorators/api-validation-exception.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResourceConflictException()
  @ApiValidationException()
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedException()
  @ApiValidationException()
  async signin(@Body() signinDto: SigninDto): Promise<AuthResponseDto> {
    return this.authService.signin(signinDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens successfully refreshed',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedException()
  @ApiValidationException()
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
