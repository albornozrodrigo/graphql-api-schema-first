import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from './entities/post.entity';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [SequelizeModule.forFeature([Post])],
  providers: [PostResolver, PostService],
})
export class PostModule {}
