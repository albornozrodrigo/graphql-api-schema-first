import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentLoader } from '../comment/comment.loader';
import { CommentService } from '../comment/comment.service';
import { Comment } from '../comment/entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { UserService } from '../user/user.service';
import { Post } from './entities/post.entity';
import { PostLoader } from './post.loader';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [SequelizeModule.forFeature([Post, User, Comment])],
  providers: [
    PostResolver,
    PostService,
    PostLoader,
    UserService,
    UserLoader,
    CommentService,
    CommentLoader,
  ],
})
export class PostModule {}
