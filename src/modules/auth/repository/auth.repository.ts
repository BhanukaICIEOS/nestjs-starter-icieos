import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import { SignupDto } from '../dtos/signup.dto';
import { RefreshToken } from '../models/refresh-token-schemas';
import { ResetToken } from '../models/reset-token.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name) private resetTokenModel: Model<ResetToken>
  ) {}

  async createUser(signupDto: SignupDto): Promise<User> {
    const user = new this.userModel(signupDto);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async createRefreshToken(userId: string, token: string): Promise<RefreshToken> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Set expiry date to 7 days from now
    const refreshToken = new this.refreshTokenModel({ userId, token, expiryDate });
    return refreshToken.save();
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({ token }).exec();
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({ token }).exec();
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: newPassword }).exec();
  }

  async createPasswordResetToken(userId: string, token: string): Promise<ResetToken> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now
    const resetToken = new this.resetTokenModel({ userId, token, expiryDate });
    return resetToken.save();
  }

  async findResetToken(token: string): Promise<ResetToken | null> {
    return this.resetTokenModel.findOne({ token }).exec();
  }

  async deleteResetToken(token: string): Promise<void> {
    await this.resetTokenModel.deleteOne({ token }).exec();
  }
}
