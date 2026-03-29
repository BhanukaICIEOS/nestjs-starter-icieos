import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User, UserDocument } from '../models/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserInput: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserInput);
    return createdUser.save();
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async getUsers(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateUser(
    id: string,
    updateUserInput: Partial<
      Omit<CreateUserDto, 'password'> & { passwordHash: string }
    >,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserInput, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async deleteUser(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
