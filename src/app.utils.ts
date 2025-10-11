import { PaginationInput } from './common/dto/pagination.input';

export const buildPagination = (pagination: PaginationInput) => {
  const limit = pagination?.limit || 10;
  const page = pagination?.page || 1;
  const offset = (page - 1) * limit;
  return { offset, limit };
};
