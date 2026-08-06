import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Member } from './member.entity';
import { Task } from './task.entity';
import { ProjectMember } from './project-member.entity';
import { InviteCode } from './invite-code.entity';

@Entity('Project')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  ownerId!: number;

  @ManyToOne(() => Member, (member) => member.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner!: Member;

  @OneToMany(() => Task, (task) => task.project)
  tasks?: Task[];

  @Column({ nullable: true })
  wipLimit?: number | null;

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
  members?: ProjectMember[];

  @OneToMany(() => InviteCode, (inviteCode) => inviteCode.project)
  inviteCodes?: InviteCode[];
}
