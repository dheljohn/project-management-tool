import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Task } from './task.entity';
import { Member } from './member.entity';

@Entity('TaskAssignee')
@Unique(['taskId', 'memberId'])
export class TaskAssignee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  taskId!: number;

  @Column()
  memberId!: number;

  @ManyToOne(() => Task, (task) => task.assignees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task!: Task;

  @ManyToOne(() => Member, (member) => member.taskAssignees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberId' })
  member!: Member;
}
