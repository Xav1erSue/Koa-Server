import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // 用于装饰整个类，使其变成一个数据库模型
export class User {
  @PrimaryGeneratedColumn() // 装饰主列，它的值将自动生成
  id: number;
  // Column用于装饰类的某个属性，使其对应于数据库表中的一列，可提供一系列选项参数
  @Column()
  name: string;
  // 我们给 password 设置了 select: false ，使得这个字段在查询时默认不被选中
  @Column({ select: false })
  password: string;

  @Column()
  email: string;
}
