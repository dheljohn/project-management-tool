import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Project } from './project.entity';
import { ChangeLog } from './change-log.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TaskStatus } from '../../enums/task-status.enum';
import { Priority } from '../../enums/priority.enum';

@Entity('Task')
@Index(['deletedAt'])
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.Todo,
  })
  status!: TaskStatus;

  @Column()
  projectId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.Medium,
  })
  priority!: Priority;

  @Column({ default: 0 })
  version!: number;

  @OneToMany(() => ChangeLog, (changeLog) => changeLog.task)
  changelogs?: ChangeLog[];

  @OneToMany(() => TaskAssignee, (assignee) => assignee.task)
  assignees?: TaskAssignee[];

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
