import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
// import { PrismaService } from '../prisma/prisma.service';
import { CacheHelper } from '../common/cache/cache.helper';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JoinProjectDto } from './dto/join-project.dto';
import { ProjectGateway } from '../gateway/project.gateway';
import { DataSource, LessThan, QueryFailedError, Repository } from 'typeorm';
import { InviteCode } from '../../database/src/Entities/invite-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';
// import { Member } from '../../database/src/Entities/member.entity';
import { Project } from '../../database/src/Entities/project.entity';
import { ProjectRole } from '../../database/enums/project-role.enum';

const DEFAULT_MAX_USES = 10;
const DEFAULT_EXPIRY_DAYS = 7;
const CODE_LENGTH = 8; // e.g. "PRXK7F2A"

@Injectable()
export class InvitesService {
  constructor(
    // private prisma: PrismaService,
    private cacheHelper: CacheHelper,
    private projectGateway: ProjectGateway,
    private readonly dataSource: DataSource,
    @InjectRepository(InviteCode)
    private readonly inviteCodeRepo: Repository<InviteCode>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
    // @InjectRepository(Member)
    // private readonly memberRepo: Repository<Member>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  private generateCode(): string {
    // Base32-ish alphabet, no ambiguous chars (0/O, 1/I/L excluded)
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(CODE_LENGTH);
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += alphabet[bytes[i] % alphabet.length];
    }
    return code;
  }

  async create(userId: number, dto: CreateInviteDto) {
    function isDuplicateEntryError(err: unknown): boolean {
      return (
        err instanceof QueryFailedError &&
        (err.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      );
    }
    // Only OWNER can generate invite codes for a project
    // const membership = await this.prisma.projectMember.findUnique({
    //   where: {
    //     projectId_memberId: { projectId: dto.projectId, memberId: userId },
    //   },
    // });

    // if (!membership) throw new NotFoundException('Project not found');
    // if (membership.role !== 'OWNER') {
    //   throw new ForbiddenException(
    //     'Only the project owner can generate invite codes',
    //   );
    // }

    // const membership = await this.projectMemberRepo.find({
    //   where: {
    //     projectId: dto.projectId,
    //     memberId: userId,
    //   },
    // });
    // const membership = await this.projectMemberRepo.findOne({
    //   where: {
    //     projectId: dto.projectId,
    //     memberId: userId,
    //     role: ProjectRole.MEMBER,
    //   },
    // });
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const membership = await this.projectMemberRepo.findOne({
      where: {
        projectId: dto.projectId,
        memberId: userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }
    // if (!membership) throw new NotFoundException('Project not found');
    if (!membership) throw new NotFoundException('Project not found');
    if (membership.role !== ProjectRole.OWNER) {
      throw new ForbiddenException(
        'Only the project owner can generate invite codes',
      );
    }

    const expiresInDays = dto.expiresInDays ?? DEFAULT_EXPIRY_DAYS;
    const maxUses = dto.maxUses ?? DEFAULT_MAX_USES;

    // Retry on the (extremely rare) chance of a code collision
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateCode();
      try {
        // return await this.prisma.inviteCode.create({
        //   data: {
        //     code,
        //     projectId: dto.projectId,
        //     createdById: userId,
        //     expiresAt: new Date(Date.now() + expiresInDays * 86400_000),
        //     maxUses,
        //   },
        // });
        return await this.inviteCodeRepo.save({
          code,
          projectId: dto.projectId,
          createdById: userId,
          expiresAt: new Date(Date.now() + expiresInDays * 86400_000),
          maxUses,
        });
      } catch (err: unknown) {
        // if (typeof err === 'string' && err === 'P2002') continue;
        if (isDuplicateEntryError(err)) {
          continue;
        }
        // if (err.code === 'P2002') continue; // unique constraint hit, retry
        throw err;
      }
    }
    throw new BadRequestException('Could not generate a unique invite code');
  }

  // async listForProject(userId: number, projectId: number) {
  //   const membership = await this.prisma.projectMember.findUnique({
  //     where: { projectId_memberId: { projectId, memberId: userId } },
  //   });
  //   if (!membership) throw new NotFoundException('Project not found');
  //   if (membership.role !== 'OWNER') {
  //     throw new ForbiddenException(
  //       'Only the project owner can view invite codes',
  //     );
  //   }

  //   return this.prisma.inviteCode.findMany({
  //     where: { projectId },
  //     orderBy: { createdAt: 'desc' },
  //   });
  // }
  async listForProject(userId: number, projectId: number) {
    const membership = await this.projectMemberRepo.findOne({
      where: {
        projectId,
        memberId: userId,
      },
    });
    if (!membership) throw new NotFoundException('Project not found');
    if (membership.role !== ProjectRole.OWNER) {
      throw new ForbiddenException(
        'Only the project owner can view invite codes',
      );
    }

    return this.inviteCodeRepo.find({
      where: { projectId },
      order: { createdAt: 'desc' },
    });
  }

  // async revoke(userId: number, inviteId: number) {
  //   const invite = await this.prisma.inviteCode.findUnique({
  //     where: { id: inviteId },
  //   });
  //   if (!invite) throw new NotFoundException('Invite not found');

  //   const membership = await this.prisma.projectMember.findUnique({
  //     where: {
  //       projectId_memberId: { projectId: invite.projectId, memberId: userId },
  //     },
  //   });
  //   if (!membership || membership.role !== 'OWNER') {
  //     throw new ForbiddenException('Only the project owner can revoke invites');
  //   }

  //   return this.prisma.inviteCode.update({
  //     where: { id: inviteId },
  //     data: { isRevoked: true },
  //   });
  // }
  async revoke(userId: number, inviteId: number) {
    const invite = await this.inviteCodeRepo.findOne({
      where: { id: inviteId },
    });
    if (!invite) throw new NotFoundException('Invite not found');

    const membership = await this.projectMemberRepo.findOne({
      where: {
        projectId: invite.projectId,
        memberId: userId,
      },
    });
    if (!membership || membership.role !== ProjectRole.OWNER) {
      throw new ForbiddenException('Only the project owner can revoke invites');
    }

    return this.inviteCodeRepo.update(
      // inviteCodeRepo,
      { id: inviteId },
      { isRevoked: true },
    );
  }

  // async join(userId: number, dto: JoinProjectDto) {
  //   // Normalize casing since users may type lowercase
  //   const code = dto.code.toUpperCase().trim();

  //   const invite = await this.prisma.inviteCode.findUnique({
  //     where: { code },
  //   });

  //   if (!invite) throw new NotFoundException('Invalid invite code');
  //   if (invite.isRevoked) {
  //     throw new BadRequestException('This invite code has been revoked');
  //   }
  //   if (invite.expiresAt < new Date()) {
  //     throw new BadRequestException('This invite code has expired');
  //   }
  //   if (invite.useCount >= invite.maxUses) {
  //     throw new BadRequestException(
  //       'This invite code has reached its usage limit',
  //     );
  //   }

  //   // Already a member? No-op, just return the project instead of erroring twice.
  //   const existingMembership = await this.prisma.projectMember.findUnique({
  //     where: {
  //       projectId_memberId: { projectId: invite.projectId, memberId: userId },
  //     },
  //   });
  //   if (existingMembership) {
  //     throw new ConflictException('You are already a member of this project');
  //   }

  //   // Wrap membership creation + use-count increment in a transaction with
  //   // a guarded update to prevent race conditions from two people redeeming
  //   // the last available slot at the same time.
  //   return this.prisma
  //     .$transaction(async (tx) => {
  //       const result = await tx.inviteCode.updateMany({
  //         where: {
  //           id: invite.id,
  //           useCount: { lt: invite.maxUses }, // re-check at write time
  //         },
  //         data: { useCount: { increment: 1 } },
  //       });

  //       if (result.count === 0) {
  //         throw new BadRequestException(
  //           'This invite code has reached its usage limit',
  //         );
  //       }

  //       const membership = await tx.projectMember.create({
  //         data: {
  //           projectId: invite.projectId,
  //           memberId: userId,
  //           role: 'MEMBER',
  //         },
  //       });

  //       const project = await tx.project.findUnique({
  //         where: { id: invite.projectId },
  //       });

  //       return { project, membership };
  //     })
  //     .then(async (result) => {
  //       await this.cacheHelper.invalidate(
  //         'all_projects',
  //         `projects_user_${userId}`,
  //       );

  //       this.projectGateway.emitToProject(invite.projectId, 'member:joined', {
  //         membership: result.membership,
  //       });

  //       return result;
  //     });
  // }
  async join(userId: number, dto: JoinProjectDto) {
    // Normalize casing since users may type lowercase
    const code = dto.code.toUpperCase().trim();

    const invite = await this.inviteCodeRepo.findOne({
      where: { code },
    });

    if (!invite) throw new NotFoundException('Invalid invite code');
    if (invite.isRevoked) {
      throw new BadRequestException('This invite code has been revoked');
    }
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('This invite code has expired');
    }
    if (invite.useCount >= invite.maxUses) {
      throw new BadRequestException(
        'This invite code has reached its usage limit',
      );
    }

    // Already a member? No-op, just return the project instead of erroring twice.
    const existingMembership = await this.projectMemberRepo.findOne({
      where: {
        projectId: invite.projectId,
        memberId: userId,
      },
    });
    if (existingMembership) {
      throw new ConflictException('You are already a member of this project');
    }

    // Wrap membership creation + use-count increment in a transaction with
    // a guarded update to prevent race conditions from two people redeeming
    // the last available slot at the same time.
    return this.dataSource
      .transaction(async (manager) => {
        const result = await manager.update(
          InviteCode,
          {
            id: invite.id,
            useCount: LessThan(invite.maxUses), // re-check at write time
          },
          { useCount: () => '`useCount` + 1' },
        );

        if (result.affected === 0) {
          throw new BadRequestException(
            'This invite code has reached its usage limit',
          );
        }

        const membership = manager.create(ProjectMember, {
          projectId: invite.projectId,
          memberId: userId,
          role: ProjectRole.MEMBER,
        });
        await manager.save(ProjectMember, membership);

        const project = await manager.findOne(Project, {
          where: { id: invite.projectId },
        });

        return { project, membership };
      })
      .then(async (result) => {
        await this.cacheHelper.invalidate(
          'all_projects',
          `projects_user_${userId}`,
        );

        this.projectGateway.emitToProject(invite.projectId, 'member:joined', {
          membership: result.membership,
        });

        return result;
      });
  }
}
