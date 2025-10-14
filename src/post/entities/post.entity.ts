import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';

export interface PostAttributes {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

export const postDataMap: Record<string, string> = {
  id: 'id',
  title: 'title',
  content: 'content',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@Table
export class Post extends Model<
  PostAttributes,
  Omit<PostAttributes, 'id' | 'author'>
> {
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
    unique: true,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  content: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
  })
  authorId: number;

  @BelongsTo(() => User)
  author: User;

  @HasMany(() => Comment)
  comments: Comment[];
}
