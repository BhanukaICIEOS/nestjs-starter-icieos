import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MessageDto } from '../../common/dtos/message.dto';
import { ApiUnknownErrorException } from '../../common/decorators/api-unknown-error-exception.decorator';
import { ApiValidationException } from '../../common/decorators/api-validation-exception.decorator';
import { TemplatedApiException } from '../../common/decorators/templated-api-exception.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { EmailAlreadyTakenException } from './exceptions/email-already-taken.exception';
import { UserService } from './user.service';
// hi bhanuka, how are you doing? I hope you are doing well. I am here to help you with your code. If you have any questions or need further assistance, please let me know.
// I am going to sliit you the code into smaller parts and explain each part in detail. This way, you can understand the code better and learn how to write similar code in the future. Let's start with the imports and the class declaration
@Controller('users')
@ApiTags('Users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiValidationException()
  @TemplatedApiException(
    () => new EmailAlreadyTakenException('jhonedoes@example.com'),
  )
  @ApiUnknownErrorException()
  @ApiCreatedResponse({
    type: MessageDto,
    description: 'User account created',
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<MessageDto> {
    this.logger.log(`POST /users - Creating user with email: ${createUserDto.email}`);
    await this.userService.createUser(createUserDto);
    this.logger.log(`POST /users - User created: ${createUserDto.email}`);
    return { message: 'User account created' };
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async getUsers(): Promise<UserResponseDto[]> {
    this.logger.log('GET /users - Fetching all users');
    const users = await this.userService.getUsers();
    this.logger.log(`GET /users - Returned ${users.length} users`);
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserResponseDto })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    this.logger.log(`GET /users/${id} - Fetching user`);
    const user = await this.userService.getUserById(id);
    this.logger.log(`GET /users/${id} - User found`);
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserResponseDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`PATCH /users/${id} - Updating user`);
    const user = await this.userService.updateUser(id, updateUserDto);
    this.logger.log(`PATCH /users/${id} - User updated`);
    return user;
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: MessageDto })
  async deleteUser(@Param('id') id: string): Promise<MessageDto> {
    this.logger.log(`DELETE /users/${id} - Deleting user`);
    await this.userService.deleteUser(id);
    this.logger.log(`DELETE /users/${id} - User deleted`);
    return { message: 'User deleted successfully' };
  }
}
