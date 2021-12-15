import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  time: Date;

  @ManyToOne((type) => User)
  @JoinColumn()
  user: User;
}

@Entity()
export class Doing {
  @PrimaryGeneratedColumn()
  id: Number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  time: Date;

  @ManyToOne((type) => User)
  @JoinColumn()
  user: User;
}

@Entity()
export class Done {
  @PrimaryGeneratedColumn()
  id: Number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  time: Date;

  @ManyToOne((type) => User)
  @JoinColumn()
  user: User;
}
