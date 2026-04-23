import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/modules/roles/dtos/role.dto';

export const PERMISSIONS_KEY = "permissions";

export const Permissions = (permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);