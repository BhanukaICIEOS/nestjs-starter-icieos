import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RolesService } from '../modules/roles/roles.service';
import { AuthRepository } from '../modules/auth/repository/auth.repository';
import { Action } from '../modules/roles/enums/action.enum';
import { Resource } from '../modules/roles/enums/resource.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
  ) {}

  async onModuleInit() {
    await this.initializeRoles();
    await this.initializeAdmin();
  }

  /**
   * Initialize default roles (admin, candidate, employer) if they don't exist
   */
  async initializeRoles() {
    this.logger.log('Initializing roles...');

    try {
      // Admin Role - Full access to everything
      const adminRole = await this.rolesService.getRoleByName('admin');
      if (!adminRole) {
        await this.rolesService.createRole({
          name: 'admin',
          permissions: [
            { 
              resource: Resource.user, 
              actions: [Action.read, Action.create, Action.update, Action.delete] 
            },
            { 
              resource: Resource.settings, 
              actions: [Action.read, Action.create, Action.update, Action.delete] 
            },
            { 
              resource: Resource.products, 
              actions: [Action.read, Action.create, Action.update, Action.delete] 
            },
          ],
        });
        this.logger.log('✓ Admin role created');
      } else {
        this.logger.log('✓ Admin role already exists');
      }

      // Candidate Role - Limited access
      const candidateRole = await this.rolesService.getRoleByName('candidate');
      if (!candidateRole) {
        await this.rolesService.createRole({
          name: 'candidate',
          permissions: [
            { 
              resource: Resource.user, 
              actions: [Action.read, Action.update] // Can read and update their own profile
            },
            { 
              resource: Resource.products, 
              actions: [Action.read] // Can view products/jobs
            },
          ],
        });
        this.logger.log('✓ Candidate role created');
      } else {
        this.logger.log('✓ Candidate role already exists');
      }

      // Employer Role - Moderate access
      const employerRole = await this.rolesService.getRoleByName('employer');
      if (!employerRole) {
        await this.rolesService.createRole({
          name: 'employer',
          permissions: [
            { 
              resource: Resource.user, 
              actions: [Action.read, Action.update] 
            },
            { 
              resource: Resource.products, 
              actions: [Action.read, Action.create, Action.update, Action.delete] // Full job posting access
            },
          ],
        });
        this.logger.log('✓ Employer role created');
      } else {
        this.logger.log('✓ Employer role already exists');
      }

      this.logger.log('Roles initialization completed');
    } catch (error) {
      this.logger.error('Error initializing roles:', error);
      throw error;
    }
  }

  /**
   * Initialize hardcoded admin user
   */
  async initializeAdmin() {
    this.logger.log('Initializing admin user...');

    const ADMIN_EMAIL = 'admin@icieos.com';
    const ADMIN_PASSWORD = 'Admin@123456'; // Change this in production!
    const ADMIN_NAME = 'System Administrator';

    try {
      // Check if admin already exists
      const existingAdmin = await this.authRepository.findByEmail(ADMIN_EMAIL);
      
      if (existingAdmin) {
        this.logger.log('✓ Admin user already exists');
        return;
      }

      // Get admin role
      const adminRole = await this.rolesService.getRoleByName('admin');
      if (!adminRole) {
        this.logger.error('Admin role not found. Cannot create admin user.');
        return;
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

      // Create admin user
      await this.authRepository.createUser({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: ADMIN_NAME,
        roleId: adminRole._id,
      });

      this.logger.log('✓ Admin user created successfully');
      this.logger.log(`  Email: ${ADMIN_EMAIL}`);
      this.logger.log(`  Password: ${ADMIN_PASSWORD}`);
      this.logger.warn('⚠️  IMPORTANT: Change admin password after first login!');
      
    } catch (error) {
      this.logger.error('Error initializing admin user:', error);
      throw error;
    }
  }

  /**
   * Manual method to reset admin password if needed
   */
  async resetAdminPassword(newPassword: string) {
    const ADMIN_EMAIL = 'admin@icieos.com';
    
    const admin = await this.authRepository.findByEmail(ADMIN_EMAIL);
    if (!admin) {
      throw new Error('Admin user not found');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await this.authRepository.updatePassword(admin.id, hashedPassword);
    this.logger.log('Admin password updated successfully');
  }
}
