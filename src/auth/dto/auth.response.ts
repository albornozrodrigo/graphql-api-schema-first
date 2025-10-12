import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AuthResponse {
  @Field()
  access_token: string;
}
