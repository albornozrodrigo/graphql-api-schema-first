/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { PaginationInput } from './common/dto/pagination.input';

export const buildPagination = (pagination: PaginationInput | undefined) => {
  if (!pagination || !pagination.limit || !pagination.page)
    return { limit: 10, offset: 0 };
  const limit = pagination?.limit || 10;
  const page = pagination?.page || 1;
  const offset = (page - 1) * limit;
  return { offset, limit };
};

export const getAttributes = (
  info: GraphQLResolveInfo,
  columnMap: Record<string, string>,
) => {
  const fields = graphqlFields(info);

  const attributes = Object.keys(fields)
    .filter((field) => field in columnMap)
    .map((field) => columnMap[field]);

  if (!attributes.includes('id')) {
    attributes.push('id');
  }

  return attributes;
};
