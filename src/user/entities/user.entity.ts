import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Post } from '../../post/entities/post.entity';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
}

export const userDataMap: Record<string, string> = {
  id: 'id',
  name: 'name',
  email: 'email',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@Table
export class User extends Model<UserAttributes, Omit<UserAttributes, 'id'>> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    unique: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @HasMany(() => Post)
  posts: Post[];
}
