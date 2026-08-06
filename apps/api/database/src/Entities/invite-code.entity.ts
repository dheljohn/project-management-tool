import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Project } from './project.entity';
import { Member } from './member.entity';

@Entity('InviteCode')
export class InviteCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column()
  projectId!: number;

  @Column()
  createdById!: number;

  @Column()
  expiresAt!: Date;

  @Column({ default: 10 })
  maxUses!: number;

  @Column({ default: 0 })
  useCount!: number;

  @Column({ default: false })
  isRevoked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Project, (project) => project.inviteCodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => Member, (member) => member.createdInvites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy!: Member;
}
