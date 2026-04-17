import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import { SignupDto } from '../dtos/signup.dto';
import { RefreshToken } from '../models/refresh-token-schemas';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>
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
}
