import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Project } from './project.entity';
import { Member } from './member.entity';
import { ProjectRole } from '../../enums/project-role.enum';

@Entity('ProjectMember')
@Unique(['projectId', 'memberId'])
export class ProjectMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  projectId!: number;

  @Column()
  memberId!: number;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER,
  })
  role!: ProjectRole;

  @CreateDateColumn()
  joinedAt!: Date;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => Member, (member) => member.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberId' })
  member!: Member;
}
