jest.mock('../app.utils', () => ({
  getAttributes: jest.fn(() => ['id', 'name', 'email']),
  buildPagination: jest.fn((pagination: { page: number; limit: number }) => ({
    offset: (pagination.page - 1) * pagination.limit,
    limit: pagination.limit,
  })),
}));
