import { UseGuards } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { buildPagination } from '../app.utils';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { PaginationInput } from '../common/dto/pagination.input';
import { PostLoader } from '../post/post.loader';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserAttributes } from './entities/user.entity';
import { CurrentUser } from './user.decorator';
import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postLoader: PostLoader,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'allUsers' })
  findAll(
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.userService.findAll(pagination, info);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.userService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query('me')
  getAuthenticatedUser(@CurrentUser() user: UserAttributes) {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { name: 'updateUser' })
  update(
    @CurrentUser() user: UserAttributes,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.userService.update(user.id, updateUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'updateUserPassword' })
  updateUserPassword(
    @CurrentUser() user: UserAttributes,
    @Args('updateUserInput') updateUserPasswordInput: UpdateUserPasswordInput,
  ) {
    return this.userService.updatePassword(user.id, updateUserPasswordInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removeUser' })
  remove(@CurrentUser() user: UserAttributes) {
    return this.userService.remove(user.id);
  }

  // Fields

  @ResolveField('posts')
  async posts(
    @Parent() user: User,
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!user) return [];

    const loader = this.postLoader.setInfo(info);
    const posts = await loader.findPostsByAuthorId.load(user.id);

    if (pagination) {
      const { limit, offset } = buildPagination(pagination);
      return posts.slice(offset, offset + limit);
    }

    return posts;
  }
}
