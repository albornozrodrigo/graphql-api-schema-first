import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';

@Resolver('Comment')
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment, { name: 'createComment' })
  create(@Args('createCommentInput') createCommentInput: CreateCommentInput) {
    return this.commentService.create(createCommentInput);
  }

  @Query(() => [Comment], { name: 'allComments' })
  findAll(@Args('updateCommentInput') pagination: PaginationInput) {
    return this.commentService.findAll(pagination);
  }

  @Query(() => Comment, { name: 'comment' })
  findOne(@Args('id') id: number) {
    return this.commentService.findOne(id);
  }

  @Mutation(() => Comment, { name: 'updateComment' })
  update(
    @Args('id') id: number,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ) {
    return this.commentService.update(id, updateCommentInput);
  }

  @Mutation(() => Boolean, { name: 'removeComment' })
  remove(@Args('id') id: number) {
    return this.commentService.remove(id);
  }
}
