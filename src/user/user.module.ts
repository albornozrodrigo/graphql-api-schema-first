import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/post/entities/post.entity';
import { PostModule } from 'src/post/post.module';
import { PostService } from 'src/post/post.service';
import { User } from './entities/user.entity';
import { UserLoader } from './user.loader';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [PostModule, SequelizeModule.forFeature([User, Post])],
  providers: [UserResolver, UserService, PostService, UserLoader],
})
export class UserModule {}
