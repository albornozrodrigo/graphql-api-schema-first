import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/post/entities/post.entity';
import { PostLoader } from 'src/post/post.loader';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entities/user.entity';
import { UserLoader } from 'src/user/user.loader';
import { UserService } from 'src/user/user.service';
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
