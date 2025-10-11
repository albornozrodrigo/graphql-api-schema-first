import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentInput } from './create-comment.input';

export class UpdateCommentInput extends PartialType(CreateCommentInput) {}
