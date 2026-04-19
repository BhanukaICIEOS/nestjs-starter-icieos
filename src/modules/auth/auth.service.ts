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
import { ChangePasswordDto } from './dtos/change-password.dto';
import { nanoid } from 'nanoid';
import { MailService } from 'src/services/mail.service';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository, private readonly jwtService: JwtService, private readonly mailService: MailService) {}

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
    await this.storeRefreshToken(refreshToken, user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
      refreshToken,
    };
  }

  async signin(signinDto: SigninDto) {
    // Find user by email
    const user = await this.authRepository.findByEmail(signinDto.email);
    if (!user) {
      throw new NotFoundException(`User email: ${signinDto.email} not found`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(signinDto.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException('Invalid Password');
    }

    // Generate token
    const accessToken = this.generateToken(user.id);
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, user.id);

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

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.authRepository.createRefreshToken(userId, token);
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
      throw new NotFoundException(`User not found`);
    }

    // Generate new tokens
    const newAccessToken = this.generateToken(user.id);
    const newRefreshToken = uuidv4();

    // Delete the old refresh token and create a new one (token rotation)
    await this.authRepository.deleteRefreshToken(refreshToken);
    await this.storeRefreshToken(newRefreshToken, user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
    // Find user by id
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User id: ${userId} not found`);
    }

    // Verify old password    
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new InvalidCredentialsException('Invalid Old Password');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Update user's password
    await this.authRepository.updatePassword(userId, hashedNewPassword);

    return { message: 'Password successfully changed' };
  }

  async forgotPassword(email: string) {
    // Find user by email
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User email: ${email} not found`);
    }

    const resetToken = nanoid(64);
    await this.authRepository.createPasswordResetToken(user.id, resetToken);
    // Send password reset email
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    // Here you would typically generate a password reset token, save it to the database, and send an email to the user with instructions on how to reset their password. For simplicity, we'll just return a message.
    return { message: 'Password reset instructions have been sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Find the reset token in the database
    const resetToken = await this.authRepository.findResetToken(token);
    
    if (!resetToken) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Check if the token has expired
    if (resetToken.expiryDate < new Date()) {
      // Delete the expired token
      await this.authRepository.deleteResetToken(token);
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Find the user
    const user = await this.authRepository.findById(resetToken.userId.toString());
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    await this.authRepository.updatePassword(user.id, hashedPassword);

    // Delete the used reset token
    await this.authRepository.deleteResetToken(token);

    return { message: 'Password successfully reset' };
  }
}
