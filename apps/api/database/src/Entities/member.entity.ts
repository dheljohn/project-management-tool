import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ChangeLog } from './change-log.entity';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { InviteCode } from './invite-code.entity';
import { TaskAssignee } from './task-assignee.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('Member')
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  user_id!: string;

  @Column({ nullable: true })
  username?: string | null;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // Projects owned by this member
  @OneToMany(() => Project, (project) => project.owner)
  projects?: Project[];

  // Projects joined through ProjectMember
  @OneToMany(() => ProjectMember, (membership) => membership.member)
  memberships?: ProjectMember[];

  // Invite codes created by this member
  @OneToMany(() => InviteCode, (invite) => invite.createdBy)
  createdInvites?: InviteCode[];

  @OneToMany(() => TaskAssignee, (assignee) => assignee.member)
  taskAssignees?: TaskAssignee[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => ChangeLog, (changeLog) => changeLog.member)
  changeLogs?: ChangeLog[];
}
