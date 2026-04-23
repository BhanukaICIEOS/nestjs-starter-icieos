import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dtos/role.dto';
import { RolesRepository } from './repository/roles.repository';

@Injectable()
export class RolesService {
    constructor(private readonly rolesRepository: RolesRepository) { }

    async createRole(role: CreateRoleDto) {
        //TODO: Validate unique names
        const existingRole = await this.rolesRepository.findByName(role.name);
        if (existingRole) {
            throw new Error('Role with this name already exists');
        }
        return this.rolesRepository.createRole(role);
    }

    async getRoleById(roleId: string) {
        return this.rolesRepository.findById(roleId);
    }
}
