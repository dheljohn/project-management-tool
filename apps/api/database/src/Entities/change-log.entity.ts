import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Task } from './task.entity';
import { Member } from './member.entity';

@Entity('ChangeLog')
export class ChangeLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  taskId!: number | null;

  @Column({ type: 'text', default: '' })
  taskTitle!: string;

  @Column()
  field!: string;

  @Column({ type: 'text', nullable: true })
  oldValue?: string | null;

  @Column({ type: 'text', nullable: true })
  newValue?: string | null;

  @Column({ type: 'text', nullable: true })
  remark?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  username!: string;

  @ManyToOne(() => Task, (task) => task.changelogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'taskId' })
  task!: Task | null;

  @ManyToOne(() => Member, (member) => member.changeLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'username',
    referencedColumnName: 'user_id',
  })
  member!: Member;
}
