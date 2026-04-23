import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../models/role.schema';
import { CreateRoleDto } from '../dtos/role.dto';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async updateRole(id: string, updateData: Partial<CreateRoleDto>): Promise<Role | null> {
    return this.roleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteRole(id: string): Promise<Role | null> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleModel.countDocuments({ name }).exec();
    return count > 0;
  }
}
