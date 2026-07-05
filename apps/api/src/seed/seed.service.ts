import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Wipe existing data in FK-safe order (children before parents).
    // TaskAssignee and InviteCode/ProjectMember must go before their
    // parent tables since they hold FKs into Project/Task/Member.
    await this.prisma.changeLog.deleteMany();
    await this.prisma.taskAssignee.deleteMany();
    await this.prisma.task.deleteMany();
    await this.prisma.inviteCode.deleteMany();
    await this.prisma.projectMember.deleteMany();
    await this.prisma.project.deleteMany();
    await this.prisma.member.deleteMany();

    // ---- Members ----
    const owner = await this.prisma.member.create({
      data: {
        user_id: 'john_doe',
        username: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      },
    });

    const memberA = await this.prisma.member.create({
      data: {
        user_id: 'sasha_iyer',
        username: 'Sasha Iyer',
        email: 'sasha@example.com',
        password: hashedPassword,
      },
    });

    const memberB = await this.prisma.member.create({
      data: {
        user_id: 'mira_chen',
        username: 'Mira Chen',
        email: 'mira@example.com',
        password: hashedPassword,
      },
    });

    // ---- Project ----
    const project = await this.prisma.project.create({
      data: {
        name: 'ProjectFlow Demo',
        description: 'Sample collaborative project for testing',
        ownerId: owner.id,
        wipLimit: 3,
      },
    });

    // ---- Project membership (owner + two joined members) ----
    await this.prisma.projectMember.create({
      data: { projectId: project.id, memberId: owner.id, role: 'OWNER' },
    });
    await this.prisma.projectMember.create({
      data: { projectId: project.id, memberId: memberA.id, role: 'MEMBER' },
    });
    await this.prisma.projectMember.create({
      data: { projectId: project.id, memberId: memberB.id, role: 'MEMBER' },
    });

    // ---- An active, unused invite code, for testing the join flow ----
    await this.prisma.inviteCode.create({
      data: {
        code: randomBytes(4).toString('hex').toUpperCase(),
        projectId: project.id,
        createdById: owner.id,
        expiresAt: new Date(Date.now() + 7 * 86400_000),
        maxUses: 10,
      },
    });

    // ---- Tasks, spread across statuses/priorities, some multi-assigned ----
    const task1 = await this.prisma.task.create({
      data: {
        title: 'Setup project',
        description: 'Initialize the repository',
        status: 'Todo',
        priority: 'Medium',
        projectId: project.id,
      },
    });

    const task2 = await this.prisma.task.create({
      data: {
        title: 'Homepage hero copy',
        description: 'Draft the hero section copy for the landing page',
        status: 'In_Progress',
        priority: 'High',
        projectId: project.id,
      },
    });

    const task3 = await this.prisma.task.create({
      data: {
        title: 'Logo exploration round 2',
        description: 'Second pass on logo concepts based on feedback',
        status: 'In_Progress',
        priority: 'Medium',
        projectId: project.id,
      },
    });

    const task4 = await this.prisma.task.create({
      data: {
        title: 'Component library migration',
        description: 'Migrate shared components to the new design tokens',
        status: 'Done',
        priority: 'Low',
        projectId: project.id,
      },
    });

    // ---- Multi-assignee wiring ----
    await this.prisma.taskAssignee.createMany({
      data: [
        { taskId: task2.id, memberId: memberA.id },
        { taskId: task3.id, memberId: memberB.id },
        { taskId: task3.id, memberId: memberA.id }, // task3 has two assignees
        { taskId: task4.id, memberId: owner.id },
      ],
    });

    // ---- Changelogs — a realistic trail of activity across members ----
    await this.prisma.changeLog.createMany({
      data: [
        {
          taskId: task1.id,
          username: owner.user_id,
          field: 'task creation',
          oldValue: '',
          newValue: task1.title,
          remark: 'Initial seed log',
        },
        {
          taskId: task2.id,
          username: memberA.user_id,
          field: 'task creation',
          oldValue: '',
          newValue: task2.title,
          remark: 'Created via UI modal',
        },
        {
          taskId: task2.id,
          username: memberA.user_id,
          field: 'status',
          oldValue: 'Todo',
          newValue: 'In_Progress',
          remark: null,
        },
        {
          taskId: task3.id,
          username: memberB.user_id,
          field: 'description',
          oldValue: '',
          newValue: task3.description,
          remark: 'Push the wordmark variants further — try a condensed cut.',
        },
        {
          taskId: task4.id,
          username: owner.user_id,
          field: 'priority',
          oldValue: 'Medium',
          newValue: 'Low',
          remark: null,
        },
        {
          taskId: task4.id,
          username: owner.user_id,
          field: 'status',
          oldValue: 'In_Progress',
          newValue: 'Done',
          remark: null,
        },
      ],
    });

    return {
      message: 'Database seeded successfully',
      credentials: [
        { user_id: owner.user_id, password: 'password123', role: 'OWNER' },
        { user_id: memberA.user_id, password: 'password123', role: 'MEMBER' },
        { user_id: memberB.user_id, password: 'password123', role: 'MEMBER' },
      ],
    };
  }
}
