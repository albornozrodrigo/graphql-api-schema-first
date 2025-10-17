import { buildPagination } from './app.utils';
import { PaginationInput } from './common/dto/pagination.input';

describe('buildPagination', () => {
  it('should return the default limit and offset when pagination is undefined', () => {
    const result = buildPagination(undefined);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('should return the specified limit and offset when pagination is defined', () => {
    const pagination: PaginationInput = { limit: 20, page: 2 };
    const result = buildPagination(pagination);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(20);
  });

  it('should return the default limit and offset when limit is undefined', () => {
    const pagination: PaginationInput = { page: 2 };
    const result = buildPagination(pagination);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('should return the default limit and offset when page is undefined', () => {
    const pagination: PaginationInput = { limit: 20 };
    const result = buildPagination(pagination);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });
});
