import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentLoader } from 'src/comment/comment.loader';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { UserLoader } from 'src/user/user.loader';
import { UserService } from 'src/user/user.service';
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
