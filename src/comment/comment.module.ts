import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from '../post/entities/post.entity';
import { PostLoader } from '../post/post.loader';
import { PostService } from '../post/post.service';
import { User } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { UserService } from '../user/user.service';
import { CommentLoader } from './comment.loader';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [SequelizeModule.forFeature([Comment, User, Post])],
  providers: [
    CommentResolver,
    CommentService,
    CommentLoader,
    UserService,
    UserLoader,
    PostService,
    PostLoader,
  ],
})
export class CommentModule {}
