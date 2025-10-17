import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from '../post/entities/post.entity';
import { PostLoader } from '../post/post.loader';
import { PostModule } from '../post/post.module';
import { PostService } from '../post/post.service';
import { User } from './entities/user.entity';
import { UserLoader } from './user.loader';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [PostModule, SequelizeModule.forFeature([User, Post])],
  providers: [UserResolver, UserService, UserLoader, PostService, PostLoader],
})
export class UserModule {}
