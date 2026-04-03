import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './repository/user.repository';
import { User, UserSchema } from './models/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// This is the UserModule which is responsible for managing user-related functionalities in the application. It imports the MongooseModule to connect to the MongoDB database and defines the User schema. The module also provides the UserService and UserRepository for handling business logic and data access, respectively. Finally, it registers the UserController to handle incoming HTTP requests related to users.

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
