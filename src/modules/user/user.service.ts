import { Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { EmailAlreadyTakenException } from './exceptions/email-already-taken.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserDocument } from './models/user.schema';
import { UserRepository } from './repository/user.repository';

const BCRYPT_HASH_ROUNDS = 10;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) { }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    const email = createUserDto.email.toLowerCase();
    const existingUser = await this.userRepository.getUserByEmail(email);

    if (existingUser) {
      this.logger.warn(`Email already taken: ${createUserDto.email}`);
      throw new EmailAlreadyTakenException(createUserDto.email);
    }

    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      BCRYPT_HASH_ROUNDS,
    );

    const createdUser = await this.userRepository.createUser({
      email,
      passwordHash,
      firstName: createUserDto.firstName.trim(),
      lastName: createUserDto.lastName.trim(),
    });

    this.logger.log(`User created successfully with email: ${email}`);
    return this.toResponseDto(createdUser);
  }

  async getUsers(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all users');
    const users = await this.userRepository.getUsers();
    this.logger.log(`Fetched ${users.length} users`);
    return users.map((user) => this.toResponseDto(user));
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    this.logger.log(`Fetching user by id: ${id}`);
    this.ensureValidObjectId(id);

    const user = await this.userRepository.getUserById(id);
    if (!user) {
      this.logger.warn(`User not found with id: ${id}`);
      throw new UserNotFoundException(id);
    }

    this.logger.log(`User found with id: ${id}`);
    return this.toResponseDto(user);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user with id: ${id}`);
    this.ensureValidObjectId(id);

    if (updateUserDto.email) {
      const email = updateUserDto.email.toLowerCase();
      const existingUser = await this.userRepository.getUserByEmail(email);
      if (existingUser && existingUser.id !== id) {
        this.logger.warn(`Email already taken: ${updateUserDto.email}`);
        throw new EmailAlreadyTakenException(updateUserDto.email);
      }
    }

    const updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      passwordHash?: string;
    } = {};

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email.toLowerCase();
    }
    if (updateUserDto.firstName !== undefined) {
      updateData.firstName = updateUserDto.firstName.trim();
    }
    if (updateUserDto.lastName !== undefined) {
      updateData.lastName = updateUserDto.lastName.trim();
    }
    if (updateUserDto.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(
        updateUserDto.password,
        BCRYPT_HASH_ROUNDS,
      );
    }

    const updatedUser = await this.userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      this.logger.warn(`User not found for update with id: ${id}`);
      throw new UserNotFoundException(id);
    }

    this.logger.log(`User updated successfully with id: ${id}`);
    return this.toResponseDto(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deleting user with id: ${id}`);
    this.ensureValidObjectId(id);

    const deletedUser = await this.userRepository.deleteUser(id);
    if (!deletedUser) {
      this.logger.warn(`User not found for deletion with id: ${id}`);
      throw new UserNotFoundException(id);
    }

    this.logger.log(`User deleted successfully with id: ${id}`);
  }

  private toResponseDto(user: UserDocument): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private ensureValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new UserNotFoundException(id);
    }
  }
}
