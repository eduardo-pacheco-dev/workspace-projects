import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const admin = await this.usersService.findByEmail('admin@admin.com');
    if (admin) return;

    const hashedPassword = await bcrypt.hash('123456', 10);
    await this.usersService.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
    });

    console.log('Seed: admin user created (admin@admin.com / 123456)');
  }
}
