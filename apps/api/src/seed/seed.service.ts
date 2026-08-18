import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from '../../database/src/Entities/member.entity';
import { Project } from '../../database/src/Entities/project.entity';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';
import { Task } from '../../database/src/Entities/task.entity';
import { TaskAssignee } from '../../database/src/Entities/task-assignee.entity';
import { RefreshToken } from '../../database/src/Entities/refresh-token.entity';
import { InviteCode } from '../../database/src/Entities/invite-code.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';
import { ProjectRole } from '../../database/enums/project-role.enum';
import { TaskStatus } from '../../database/enums/task-status.enum';
import { Priority } from '../../database/enums/priority.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(ChangeLog)
    private readonly changeLogRepo: Repository<ChangeLog>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignee)
    private readonly taskAssigneeRepo: Repository<TaskAssignee>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(InviteCode)
    private readonly inviteCodeRepo: Repository<InviteCode>,
  ) {}

  async seed() {
    const seedStart = Date.now();
    this.logger.log('=== SEED START ===');

    this.logger.debug('Hashing shared demo password...');
    const t0 = Date.now();
    const hashedPassword = await bcrypt.hash('password123', 10);
    this.logger.debug(`Password hashed in ${Date.now() - t0}ms`);

    // ---- Wipe existing data (children before parents, FK-safe) ----
    this.logger.log('--- Wiping existing data (FK-safe order) ---');
    try {
      const wipeStart = Date.now();

      // this.logger.debug('Clearing ChangeLog...');
      // await this.changeLogRepository.clear();

      // this.logger.debug('Clearing TaskAssignee...');
      // await this.taskAssigneeRepository.clear();

      // this.logger.debug('Clearing InviteCode...');
      // await this.inviteCodeRepository.clear();

      // this.logger.debug('Clearing ProjectMember...');
      // await this.projectMemberRepository.clear();

      // this.logger.debug('Clearing Task...');
      // await this.taskRepository.clear();

      // this.logger.debug('Clearing RefreshToken...');
      // await this.refreshTokenRepository.clear();

      // this.logger.debug('Clearing Project...');
      // await this.projectRepository.clear();

      // this.logger.debug('Clearing Member...');
      // await this.memberRepository.clear();
      this.logger.debug('Clearing ChangeLog...');
      await this.changeLogRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing TaskAssignee...');
      await this.taskAssigneeRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing InviteCode...');
      await this.inviteCodeRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing ProjectMember...');
      await this.projectMemberRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing Task...');
      await this.taskRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing RefreshToken...');
      await this.refreshTokenRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing Project...');
      await this.projectRepo.createQueryBuilder().delete().execute();

      this.logger.debug('Clearing Member...');
      await this.memberRepo.createQueryBuilder().delete().execute();

      this.logger.log(`--- Wipe complete in ${Date.now() - wipeStart}ms ---`);
    } catch (err) {
      this.logger.error(
        'Wipe step failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Members ----
    this.logger.log('--- Creating members ---');
    let owner: Member, memberA: Member, memberB: Member;
    try {
      owner = await this.memberRepo.save({
        user_id: 'john_doe',
        username: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });
      this.logger.debug(
        `Created owner: id=${owner.id} user_id=${owner.user_id}`,
      );

      memberA = await this.memberRepo.save({
        user_id: 'sasha_iyer',
        username: 'Sasha Iyer',
        email: 'sasha@example.com',
        password: hashedPassword,
      });
      this.logger.debug(
        `Created memberA: id=${memberA.id} user_id=${memberA.user_id}`,
      );

      memberB = await this.memberRepo.save({
        user_id: 'mira_chen',
        username: 'Mira Chen',
        email: 'mira@example.com',
        password: hashedPassword,
      });
      this.logger.debug(
        `Created memberB: id=${memberB.id} user_id=${memberB.user_id}`,
      );
    } catch (err) {
      this.logger.error(
        'Member creation failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Project ----
    this.logger.log('--- Creating project ---');
    let project: Project;
    try {
      project = await this.projectRepo.save({
        name: 'ProjectFlow Demo',
        description: 'Sample collaborative project for testing',
        ownerId: owner.id,
        wipLimit: 3,
      });
      this.logger.debug(
        `Created project: id=${project.id} name="${project.name}" ownerId=${project.ownerId}`,
      );
    } catch (err) {
      this.logger.error(
        'Project creation failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Project members ----
    this.logger.log('--- Creating project members ---');
    try {
      const pmOwner = await this.projectMemberRepo.save({
        projectId: project.id,
        memberId: owner.id,
        role: ProjectRole.OWNER,
      });
      this.logger.debug(
        `ProjectMember created: projectId=${pmOwner.projectId} memberId=${pmOwner.memberId} role=${pmOwner.role}`,
      );

      const pmA = await this.projectMemberRepo.save({
        projectId: project.id,
        memberId: memberA.id,
        role: ProjectRole.MEMBER,
      });
      this.logger.debug(
        `ProjectMember created: projectId=${pmA.projectId} memberId=${pmA.memberId} role=${pmA.role}`,
      );

      const pmB = await this.projectMemberRepo.save({
        projectId: project.id,
        memberId: memberB.id,
        role: ProjectRole.MEMBER,
      });
      this.logger.debug(
        `ProjectMember created: projectId=${pmB.projectId} memberId=${pmB.memberId} role=${pmB.role}`,
      );
    } catch (err) {
      this.logger.error(
        'ProjectMember creation failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Invite code ----
    this.logger.log('--- Creating invite code ---');
    try {
      const code = randomBytes(4).toString('hex').toUpperCase();
      const invite = await this.inviteCodeRepo.save({
        code,
        projectId: project.id,
        createdById: owner.id,
        expiresAt: new Date(Date.now() + 7 * 86400_000),
        maxUses: 10,
      });
      this.logger.debug(
        `InviteCode created: code=${invite.code} expiresAt=${invite.expiresAt.toISOString()}`,
      );
    } catch (err) {
      this.logger.error(
        'InviteCode creation failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Tasks ----
    this.logger.log('--- Creating tasks ---');
    let task1: Task, task2: Task, task3: Task, task4: Task;
    try {
      task1 = await this.taskRepo.save({
        title: 'Setup project',
        description: 'Initialize the repository',
        status: TaskStatus.Done,
        priority: Priority.High,
        projectId: project.id,
      });
      this.logger.debug(
        `Task created: id=${task1.id} title="${task1.title}" status=${task1.status}`,
      );

      task2 = await this.taskRepo.save({
        title: 'Homepage hero copy',
        description: 'Draft the hero section copy for the landing page',
        status: TaskStatus.In_Progress,
        priority: Priority.Low,
        projectId: project.id,
      });
      this.logger.debug(
        `Task created: id=${task2.id} title="${task2.title}" status=${task2.status}`,
      );

      task3 = await this.taskRepo.save({
        title: 'Logo exploration round 2',
        description: 'Second pass on logo concepts based on feedback',
        status: TaskStatus.In_Progress,
        priority: Priority.Medium,
        projectId: project.id,
      });
      this.logger.debug(
        `Task created: id=${task3.id} title="${task3.title}" status=${task3.status}`,
      );

      task4 = await this.taskRepo.save({
        title: 'Component library migration',
        description: 'Migrate shared components to the new design tokens',
        status: TaskStatus.In_Progress,
        priority: Priority.Low,
        projectId: project.id,
      });
      this.logger.debug(
        `Task created: id=${task4.id} title="${task4.title}" status=${task4.status}`,
      );
    } catch (err) {
      this.logger.error(
        'Task creation failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Task assignees ----
    this.logger.log('--- Assigning tasks ---');
    try {
      const assigneeRows = [
        { taskId: task2.id, memberId: memberA.id },
        { taskId: task3.id, memberId: memberB.id },
        { taskId: task3.id, memberId: memberA.id }, // task3 has two assignees
        { taskId: task4.id, memberId: owner.id },
      ];
      this.logger.debug(
        `Inserting ${assigneeRows.length} task assignee rows: ${JSON.stringify(assigneeRows)}`,
      );
      const result = await this.taskAssigneeRepo.insert(assigneeRows);
      this.logger.debug(
        `TaskAssignee insert result: ${result.identifiers.length} rows inserted`,
      );
    } catch (err) {
      this.logger.error(
        'TaskAssignee insert failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    // ---- Change logs ----
    this.logger.log('--- Inserting change logs ---');
    try {
      const changeLogRows = [
        {
          taskId: task1.id,
          taskTitle: task1.title,
          username: owner.user_id,
          field: 'task creation',
          oldValue: '',
          newValue: task1.title,
          remark: null,
        },
        {
          taskId: task2.id,
          taskTitle: task2.title,
          username: memberA.user_id,
          field: 'task creation',
          oldValue: '',
          newValue: task2.title,
          remark: null,
        },
        {
          taskId: task2.id,
          taskTitle: task2.title,
          username: memberA.user_id,
          field: 'status',
          oldValue: 'Todo',
          newValue: 'In_Progress',
          remark: null,
        },
        {
          taskId: task3.id,
          taskTitle: task3.title,
          username: memberB.user_id,
          field: 'description',
          oldValue: '',
          newValue: task3.description,
          remark: 'Push the wordmark variants further — try a condensed cut.',
        },
        {
          taskId: task3.id,
          taskTitle: task3.title,
          username: memberA.user_id,
          field: 'assignees',
          oldValue: '',
          newValue: `${memberB.id},${memberA.id}`,
          remark: null,
        },
        {
          taskId: task4.id,
          taskTitle: task4.title,
          username: owner.user_id,
          field: 'priority',
          oldValue: 'Medium',
          newValue: 'Low',
          remark: null,
        },
        {
          taskId: task4.id,
          taskTitle: task4.title,
          username: owner.user_id,
          field: 'status',
          oldValue: 'In_Progress',
          newValue: 'Done',
          remark: null,
        },
      ];
      this.logger.debug(`Inserting ${changeLogRows.length} change log rows`);
      const result = await this.changeLogRepo.insert(changeLogRows);
      this.logger.debug(
        `ChangeLog insert result: ${result.identifiers.length} rows inserted`,
      );
    } catch (err) {
      this.logger.error(
        'ChangeLog insert failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }

    const totalMs = Date.now() - seedStart;
    this.logger.log(`=== SEED COMPLETE in ${totalMs}ms ===`);

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
