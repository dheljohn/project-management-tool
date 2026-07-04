import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Wipe existing data in FK-safe order (children before parents)
    await this.prisma.changeLog.deleteMany();
    await this.prisma.task.deleteMany();
    await this.prisma.inviteCode.deleteMany();
    await this.prisma.projectMember.deleteMany();
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

    // Seed the owner's ProjectMember row — required for membership-based
    // access checks (findAllByUser, findOne, invite generation, etc.)
    await this.prisma.projectMember.create({
      data: {
        projectId: project1.id,
        memberId: member1.id,
        role: 'OWNER',
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
