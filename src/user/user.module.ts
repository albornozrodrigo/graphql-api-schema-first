import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/post/entities/post.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Post])],
  providers: [UserResolver, UserService],
})
export class UserModule {}
