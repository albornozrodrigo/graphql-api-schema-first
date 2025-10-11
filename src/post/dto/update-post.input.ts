import { PartialType } from '@nestjs/mapped-types';
import { CreatePostInput } from './create-post.input';

export class UpdatePostInput extends PartialType(CreatePostInput) {}
