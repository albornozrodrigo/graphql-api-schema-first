/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../../__mock__/pagination';
import { CommentLoader } from '../comment.loader';
import { CommentService } from '../comment.service';

describe('CommentLoader', () => {
  let loader: CommentLoader;
  let commentService: jest.Mocked<CommentService>;

  const mockComment = {
    id: 1,
    comment: 'Test comment',
    postId: 1,
    userId: 1,
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentLoader,
        {
          provide: CommentService,
          useValue: {
            findAllByPostIds: jest.fn(),
            findAllByUserIds: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = await module.resolve<CommentLoader>(CommentLoader);
    commentService = module.get(CommentService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('setInfo', () => {
    it('should set GraphQL resolve info and return loader instance', () => {
      const result = loader.setInfo(mockGraphQLResolveInfo);

      expect(result).toBe(loader);
    });
  });

  describe('findCommentsByPostId', () => {
    beforeEach(() => {
      loader.setInfo(mockGraphQLResolveInfo);
    });

    it('should load comments for single post id', async () => {
      const postId = 1;
      const comments = [
        { ...mockComment, id: 1, postId: 1 },
        { ...mockComment, id: 2, postId: 1, comment: 'Comment 2' },
      ];

      commentService.findAllByPostIds.mockResolvedValue(comments);

      const result = await loader.findCommentsByPostId.load(postId);

      expect(commentService.findAllByPostIds).toHaveBeenCalledWith(
        [postId],
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(comments);
    });

    it('should cache results for same post id', async () => {
      const postId = 1;
      const comments = [
        { ...mockComment, id: 1, postId: 1 },
        { ...mockComment, id: 2, postId: 1, comment: 'Comment 2' },
      ];

      commentService.findAllByPostIds.mockResolvedValue(comments);

      // First call
      const result1 = await loader.findCommentsByPostId.load(postId);

      // Second call should use cache
      const result2 = await loader.findCommentsByPostId.load(postId);

      expect(commentService.findAllByPostIds).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(comments);
      expect(result2).toEqual(comments);
    });
  });

  describe('findCommentsByUserId', () => {
    beforeEach(() => {
      loader.setInfo(mockGraphQLResolveInfo);
    });

    it('should load comments for single user id', async () => {
      const userId = 1;
      const comments = [
        { ...mockComment, id: 1, userId, postId: 1 },
        { ...mockComment, id: 2, userId, postId: 2, comment: 'Comment 2' },
      ];

      commentService.findAllByUserIds.mockResolvedValue(comments);

      const result = await loader.findCommentsByUserId.load(userId);

      expect(commentService.findAllByUserIds).toHaveBeenCalledWith(
        [userId],
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(
        comments.filter((comment) => comment.userId === userId),
      );
    });

    it('should cache results for same user id', async () => {
      const userId = 1;
      const comments = [
        { ...mockComment, id: 1, userId: 1, postId: 1 },
        { ...mockComment, id: 2, userId: 1, postId: 2, comment: 'Comment 2' },
      ];

      commentService.findAllByUserIds.mockResolvedValue(comments);

      // First call
      const result1 = await loader.findCommentsByUserId.load(userId);

      // Second call should use cache
      const result2 = await loader.findCommentsByUserId.load(userId);

      expect(commentService.findAllByUserIds).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(comments);
      expect(result2).toEqual(comments);
    });
  });
});
