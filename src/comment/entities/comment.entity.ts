import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Post } from '../../post/entities/post.entity';
import { User } from '../../user/entities/user.entity';

export interface CommentAttributes {
  id: number;
  comment: string;
  postId: number;
  userId: number;
}

export const commentDataMap: Record<string, string> = {
  id: 'id',
  comment: 'comment',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@Table
export class Comment extends Model<
  CommentAttributes,
  Omit<CommentAttributes, 'id' | 'user' | 'post'>
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
  })
  comment: string;

  @ForeignKey(() => Post)
  @Column({
    allowNull: false,
  })
  postId: number;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => Post)
  post: Post;

  @BelongsTo(() => User)
  user: User;
}
