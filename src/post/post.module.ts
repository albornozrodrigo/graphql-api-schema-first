import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Post } from './entities/post.entity';
import { PostLoader } from './post.loader';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [SequelizeModule.forFeature([Post, User, Comment])],
  providers: [
    PostResolver,
    PostLoader,
    PostService,
    UserService,
    CommentService,
  ],
})
export class PostModule {}
