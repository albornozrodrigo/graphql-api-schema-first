import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { buildPagination } from 'src/app.utils';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PostService } from 'src/post/post.service';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserAttributes } from './entities/user.entity';
import { CurrentUser } from './user.decorator';
import { UserLoader } from './user.loader';
import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly userLoader: UserLoader,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'allUsers' })
  findAll(@Args('pagination') pagination: PaginationInput) {
    return this.userService.findAll(pagination);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id') id: number) {
    return this.userService.findOne(id);
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
  ) {
    if (!user) return [];
    const allPosts = await this.userLoader.postsByAuthor.load(user.id);

    if (pagination) {
      const { limit, offset } = buildPagination(pagination);
      return allPosts.slice(offset, offset + limit);
    }

    return allPosts;
  }
}
