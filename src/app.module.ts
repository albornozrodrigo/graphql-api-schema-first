import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/entities/comment.entity';
import { LoadersModule } from './common/loaders.module';
import { Post } from './post/entities/post.entity';
import { PostModule } from './post/post.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadModels: true,
      synchronize: true,
      // sync: { force: true },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
    SequelizeModule.forFeature([User, Post, Comment]),
    // GraphQLModule.forRootAsync<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   imports: [LoadersModule],
    //   inject: [UserPostsLoader],
    //   useFactory: () => ({
    //     playground: true,
    //     typePaths: ['./**/*.graphql'],
    //     definitions: {
    //       path: join(process.cwd(), 'src/graphql.ts'),
    //     },
    //     context: ({ req }) => {
    //       return { req };
    //     },
    //     formatError: (error) => {
    //       return {
    //         message: error.message,
    //         code: error.extensions?.code,
    //       };
    //     },
    //   }),
    // }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code,
        };
      },
    }),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    LoadersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
