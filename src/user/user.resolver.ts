import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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

  @Mutation(() => User, { name: 'updateUser' })
  update(
    @Args('id') id: number,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.userService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean, { name: 'updateUserPassword' })
  updateUserPassword(
    @Args('id') id: number,
    @Args('updateUserInput') updateUserPasswordInput: UpdateUserPasswordInput,
  ) {
    return this.userService.updatePassword(id, updateUserPasswordInput);
  }

  @Mutation(() => Boolean, { name: 'removeUser' })
  remove(@Args('id') id: number) {
    return this.userService.remove(id);
  }
}
