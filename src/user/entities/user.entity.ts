import * as bcrypt from 'bcrypt';
import {
  BeforeCreate,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Post } from '../../post/entities/post.entity';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
}

// @DefaultScope(() => ({
//   attributes: { exclude: ['password'] },
// }))
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

  @BeforeCreate
  static async hashPassword(instance: User) {
    const user = instance.get({ plain: true });
    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(user.password, salt);
  }
}
