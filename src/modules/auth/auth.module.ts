import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repository/auth.repository';
import { User, UserSchema } from './models/user.schema';
import { RefreshToken, RefreshTokenSchema } from './models/refresh-token-schemas';
import { ResetToken, ResetTokenSchema } from './models/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    RolesModule,
    // forwardRef(() => RolesModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: ResetToken.name, schema: ResetTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, MailService],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
