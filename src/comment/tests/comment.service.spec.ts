/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../../__mock__/pagination';
import { PaginationInput } from '../../common/dto/pagination.input';
import { CommentService } from '../comment.service';
import { CreateCommentInput } from '../dto/create-comment.input';
import { UpdateCommentInput } from '../dto/update-comment.input';
import { Comment } from '../entities/comment.entity';

describe('CommentService', () => {
  let service: CommentService;
  let commentModel: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByPk: jest.Mock;
    update: jest.Mock;
    destroy: jest.Mock;
  };

  const mockComment = {
    id: 1,
    comment: 'Test comment',
    postId: 1,
    userId: 1,
    get: jest.fn().mockReturnValue({
      id: 1,
      comment: 'Test comment',
      postId: 1,
      userId: 1,
    }),
  };

  const mockCreateCommentInput: CreateCommentInput = {
    comment: 'Test comment',
    postId: 1,
    userId: 1,
  };

  const mockUpdateCommentInput: UpdateCommentInput = {
    comment: 'Updated comment',
    userId: 1,
  };

  const mockPaginationInput: PaginationInput = {
    limit: 10,
    page: 1,
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getModelToken(Comment),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByPk: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentModel = module.get(getModelToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      commentModel.create.mockResolvedValue(mockComment);

      const result = await service.create(mockCreateCommentInput);

      expect(commentModel.create).toHaveBeenCalledWith(mockCreateCommentInput);
      expect(result).toEqual(mockComment.get());
    });
  });

  describe('findAll', () => {
    it('should return all comments with pagination', async () => {
      const comments = [mockComment];
      commentModel.findAll.mockResolvedValue(comments);

      const result = await service.findAll(
        mockPaginationInput,
        mockGraphQLResolveInfo,
      );

      expect(commentModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockComment.get()]);
    });
  });

  describe('findAllByPostIds', () => {
    it('should return comments by post ids', async () => {
      const comments = [mockComment];
      commentModel.findAll.mockResolvedValue(comments);

      const result = await service.findAllByPostIds(
        [1, 2],
        mockGraphQLResolveInfo,
      );

      expect(commentModel.findAll).toHaveBeenCalledWith({
        where: { postId: { [Symbol.for('in')]: [1, 2] } },
        attributes: expect.any(Array),
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual([mockComment.get()]);
    });
  });

  describe('findAllByPostId', () => {
    it('should return comments by post id', async () => {
      const comments = [mockComment];
      commentModel.findAll.mockResolvedValue(comments);

      const result = await service.findAllByPostId(
        1,
        mockPaginationInput,
        mockGraphQLResolveInfo,
      );

      expect(commentModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId: 1 },
        }),
      );
      expect(result).toEqual([mockComment.get()]);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      commentModel.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne(1, mockGraphQLResolveInfo);

      expect(commentModel.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: expect.any(Array),
      });
      expect(result).toEqual(mockComment.get());
    });

    it('should throw error when comment not found', async () => {
      commentModel.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999, mockGraphQLResolveInfo),
      ).rejects.toThrow('Comment not found');
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const currentComment = {
        get: jest.fn().mockReturnValue({
          id: 1,
          comment: 'Test comment',
          postId: 1,
          userId: 1,
        }),
      };
      commentModel.findByPk.mockResolvedValue(currentComment);
      commentModel.update.mockResolvedValue([1]);

      const result = await service.update(1, mockUpdateCommentInput);

      expect(commentModel.findByPk).toHaveBeenCalledWith(1);
      expect(commentModel.update).toHaveBeenCalledWith(mockUpdateCommentInput, {
        where: { id: 1 },
      });
      expect(result).toEqual({
        ...currentComment.get(),
        ...mockUpdateCommentInput,
      });
    });

    it('should throw error when comment not found', async () => {
      commentModel.findByPk.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateCommentInput)).rejects.toThrow(
        'Comment not found',
      );
    });

    it('should throw error when user is not authorized', async () => {
      const currentComment = {
        get: jest.fn().mockReturnValue({
          id: 1,
          comment: 'Test comment',
          postId: 1,
          userId: 2, // Different user
        }),
      };
      commentModel.findByPk.mockResolvedValue(currentComment);

      await expect(service.update(1, mockUpdateCommentInput)).rejects.toThrow(
        'You are not authorized to update this comment',
      );
    });

    it('should throw error when update fails', async () => {
      const currentComment = {
        get: jest.fn().mockReturnValue({
          id: 1,
          comment: 'Test comment',
          postId: 1,
          userId: 1,
        }),
      };
      commentModel.findByPk.mockResolvedValue(currentComment);
      commentModel.update.mockResolvedValue([0]);

      await expect(service.update(1, mockUpdateCommentInput)).rejects.toThrow(
        'Comment not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const comment = {
        userId: 1,
      };
      commentModel.findByPk.mockResolvedValue(comment);
      commentModel.destroy.mockResolvedValue(1);

      const result = await service.remove(1, 1);

      expect(commentModel.findByPk).toHaveBeenCalledWith(1);
      expect(commentModel.destroy).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(result).toBe(true);
    });

    it('should throw error when comment not found', async () => {
      commentModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow('Comment not found');
    });

    it('should throw error when user is not authorized', async () => {
      const comment = {
        userId: 2, // Different user
      };
      commentModel.findByPk.mockResolvedValue(comment);

      await expect(service.remove(1, 1)).rejects.toThrow(
        'You are not authorized to delete this comment',
      );
    });

    it('should return false when removal fails', async () => {
      const comment = {
        userId: 1,
      };
      commentModel.findByPk.mockResolvedValue(comment);
      commentModel.destroy.mockResolvedValue(0);

      const result = await service.remove(1, 1);

      expect(result).toBe(false);
    });
  });
});
