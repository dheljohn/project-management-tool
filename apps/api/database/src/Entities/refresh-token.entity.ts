import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Member } from './member.entity';

@Entity('RefreshToken')
@Index(['userId'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  jti!: string;

  @Column()
  userId!: number;

  @ManyToOne(() => Member, (member) => member.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: Member;

  @Column()
  expiresAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  revokedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
