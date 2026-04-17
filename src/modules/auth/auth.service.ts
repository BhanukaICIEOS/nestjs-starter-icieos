import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dtos/signup.dto';
import { SigninDto } from './dtos/signin.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { AuthRepository } from './repository/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { InvalidCredentialsException, NotFoundException } from 'src/common/exceptions';
import { EmailAlreadyTakenException, InvalidRefreshTokenException } from 'src/common/exceptions/domain';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository, private readonly jwtService: JwtService  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(signupDto.email);
    if (existingUser) {
      throw new EmailAlreadyTakenException(signupDto.email);
    }

    // Hash password
    const saltRounds = 10; // no of rounds for security
    const hashedPassword = await bcrypt.hash(signupDto.password, saltRounds);

    // Create user
    const user = await this.authRepository.createUser({
      ...signupDto,
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = this.generateToken(user.id);
    const refreshToken = uuidv4();
    await this.authRepository.createRefreshToken(user.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    };
  }

  async signin(signinDto: SigninDto) {
    // Find user by email
    const user = await this.authRepository.findByEmail(signinDto.email);
    if (!user) {
      throw new NotFoundException(`User not found for email: ${signinDto.email}`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(signinDto.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Generate token
    const accessToken = this.generateToken(user.id);
    const refreshToken = uuidv4();
    await this.authRepository.createRefreshToken(user.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
      refreshToken,
    };
  }

  private generateToken(userId: string): string {
    
    const accessToken = this.jwtService.sign({ userId }, {expiresIn: '1h' });
    return accessToken;
  }

  async refreshTokens(refreshToken: string) {
    // Find the refresh token in the database
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    
    if (!storedToken) {
      throw new InvalidRefreshTokenException();
    }

    // Check if the token has expired
    if (storedToken.expiryDate < new Date()) {
      // Delete the expired token
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw new InvalidRefreshTokenException();
    }

    // Find the user
    const user = await this.authRepository.findById(storedToken.userId.toString());
    if (!user) {
      throw new NotFoundException(`User not found for id: ${storedToken.userId}`);
    }

    // Generate new tokens
    const newAccessToken = this.generateToken(user.id);
    const newRefreshToken = uuidv4();

    // Delete the old refresh token and create a new one (token rotation)
    await this.authRepository.deleteRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken(user.id, newRefreshToken);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
