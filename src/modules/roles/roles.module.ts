import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './models/role.schema';
import { RolesRepository } from './repository/roles.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // AuthModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
})
export class RolesModule {}
