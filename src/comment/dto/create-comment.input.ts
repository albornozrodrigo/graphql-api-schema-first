import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field(() => String, { nullable: false })
  comment: string;

  @Field(() => Int, { nullable: false })
  postId: number;

  @Field(() => Int, { nullable: false })
  userId: number;
}
