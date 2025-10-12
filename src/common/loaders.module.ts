import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { PostLoader } from 'src/post/post.loader';
import { PostModule } from 'src/post/post.module';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entities/user.entity';
import { UserLoader } from 'src/user/user.loader';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [PostModule, SequelizeModule.forFeature([Post, User, Comment])],
  providers: [UserLoader, PostLoader, UserService, PostService, CommentService],
  exports: [UserLoader],
})
export class LoadersModule {}
