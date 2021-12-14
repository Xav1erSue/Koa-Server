import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Todo, Doing, Done } from './todolist';

@Entity() // 用于装饰整个类，使其变成一个数据库模型
export class User {
  @PrimaryGeneratedColumn() // 装饰主列，它的值将自动生成
  id: number;
  // Column用于装饰类的某个属性，使其对应于数据库表中的一列，可提供一系列选项参数
  @Column()
  name: string;
  // 查询时默认不被选中
  @Column({ select: false })
  password: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  //反向代理：todo
  @OneToMany(() => Todo, (Todo) => Todo.user)
  todos: Todo[];

  //反向代理：doing
  @OneToMany(() => Doing, (Doing) => Doing.user)
  doings: Doing[];

  //反向代理：done
  @OneToMany(() => Done, (Done) => Done.user)
  dones: Done[];

  @CreateDateColumn()
  createdDate: Date;
}
