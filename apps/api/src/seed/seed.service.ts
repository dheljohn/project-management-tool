import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}
  async seed() {
    // Wipe existing data in correct order (FK safe)
    const hashedPassword = await bcrypt.hash('password123', 10);
    await this.prisma.changeLog.deleteMany();
    await this.prisma.task.deleteMany();
    await this.prisma.project.deleteMany();
    await this.prisma.member.deleteMany();

    // Create members
    const member1 = await this.prisma.member.create({
      data: {
        user_id: 'john_doe',
        email: 'john@example.com',
        password: hashedPassword,
      },
    });

    // Create projects under member1
    const project1 = await this.prisma.project.create({
      data: {
        name: 'ProjectFlow Demo',
        description: 'Sample project for testing',
        ownerId: member1.id,
      },
    });

    // Create tasks
    const task1 = await this.prisma.task.create({
      data: {
        title: 'Setup project',
        description: 'Initialize the repository',
        status: 'Todo',
        projectId: project1.id,
      },
    });

    // Create changelogs
    await this.prisma.changeLog.create({
      data: {
        taskId: task1.id,
        username: member1.user_id,
        field: 'task creation',
        oldValue: '',
        newValue: 'Task Created',
        remark: 'Initial seed log',
      },
    });

    return { message: 'Database seeded successfully' };
  }
}
