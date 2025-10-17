/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../../__mock__/pagination';
import { PaginationInput } from '../../common/dto/pagination.input';
import { PostLoader } from '../../post/post.loader';
import { UserAttributes } from '../../user/entities/user.entity';
import { UserLoader } from '../../user/user.loader';
import { CommentResolver } from '../comment.resolver';
import { CommentService } from '../comment.service';
import { CreateCommentInput } from '../dto/create-comment.input';
import { UpdateCommentInput } from '../dto/update-comment.input';
import { Comment } from '../entities/comment.entity';

describe('CommentResolver', () => {
  let resolver: CommentResolver;
  let commentService: jest.Mocked<CommentService>;
  let postLoader: jest.Mocked<PostLoader>;
  let userLoader: jest.Mocked<UserLoader>;

  const mockUser: UserAttributes = {
    id: 1,
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'hashedPassword123',
  };

  const mockComment: Comment = {
    id: 1,
    comment: 'Test comment',
    postId: 1,
    userId: 1,
  } as Comment;

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
        CommentResolver,
        {
          provide: CommentService,
          useValue: {
            findAll: jest.fn(),
            findAllByPostId: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PostLoader,
          useValue: {
            setInfo: jest.fn(),
            findPostsByPostId: {
              load: jest.fn(),
            },
          },
        },
        {
          provide: UserLoader,
          useValue: {
            setInfo: jest.fn(),
            findUsersByUserId: {
              load: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    resolver = module.get<CommentResolver>(CommentResolver);
    commentService = module.get(CommentService);
    postLoader = module.get(PostLoader);
    userLoader = module.get(UserLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Queries', () => {
    describe('findAll', () => {
      it('should return all comments with pagination', async () => {
        const comments = [mockComment];
        commentService.findAll.mockResolvedValue(comments);

        const result = await resolver.findAll(
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );

        expect(commentService.findAll).toHaveBeenCalledWith(
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(comments);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Database error');
        commentService.findAll.mockRejectedValue(error);

        await expect(
          resolver.findAll(mockPaginationInput, mockGraphQLResolveInfo),
        ).rejects.toThrow('Database error');
      });
    });

    describe('findAllByPostId', () => {
      it('should return comments by post id', async () => {
        const comments = [mockComment];
        commentService.findAllByPostId.mockResolvedValue(comments);

        const result = await resolver.findAllByPostId(
          1,
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );

        expect(commentService.findAllByPostId).toHaveBeenCalledWith(
          1,
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(comments);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Post not found');
        commentService.findAllByPostId.mockRejectedValue(error);

        await expect(
          resolver.findAllByPostId(
            999,
            mockPaginationInput,
            mockGraphQLResolveInfo,
          ),
        ).rejects.toThrow('Post not found');
      });
    });

    describe('findOne', () => {
      it('should return a comment by id', async () => {
        commentService.findOne.mockResolvedValue(mockComment);

        const result = await resolver.findOne(1, mockGraphQLResolveInfo);

        expect(commentService.findOne).toHaveBeenCalledWith(
          1,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(mockComment);
      });

      it('should throw an error when comment not found', async () => {
        const error = new Error('Comment not found');
        commentService.findOne.mockRejectedValue(error);

        await expect(
          resolver.findOne(999, mockGraphQLResolveInfo),
        ).rejects.toThrow('Comment not found');
      });
    });
  });

  describe('Mutations', () => {
    describe('create', () => {
      it('should create a new comment', async () => {
        const inputWithoutUserId = {
          comment: 'Test comment',
          postId: 1,
          userId: 0, // Will be overridden by resolver
        };
        commentService.create.mockResolvedValue(mockComment);

        const result = await resolver.create(mockUser, inputWithoutUserId);

        expect(commentService.create).toHaveBeenCalledWith({
          ...inputWithoutUserId,
          userId: mockUser.id,
        });
        expect(result).toEqual(mockComment);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Failed to create comment');
        commentService.create.mockRejectedValue(error);

        await expect(
          resolver.create(mockUser, mockCreateCommentInput),
        ).rejects.toThrow('Failed to create comment');
      });
    });

    describe('update', () => {
      it('should update a comment', async () => {
        const inputWithoutUserId = {
          comment: 'Updated comment',
        };
        const updatedComment = { ...mockComment, comment: 'Updated comment' };
        commentService.update.mockResolvedValue(updatedComment);

        const result = await resolver.update(mockUser, 1, inputWithoutUserId);

        expect(commentService.update).toHaveBeenCalledWith(1, {
          ...inputWithoutUserId,
          userId: mockUser.id,
        });
        expect(result).toEqual(updatedComment);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Comment not found');
        commentService.update.mockRejectedValue(error);

        await expect(
          resolver.update(mockUser, 999, mockUpdateCommentInput),
        ).rejects.toThrow('Comment not found');
      });
    });

    describe('remove', () => {
      it('should remove a comment', async () => {
        commentService.remove.mockResolvedValue(true);

        const result = await resolver.remove(mockUser, 1);

        expect(commentService.remove).toHaveBeenCalledWith(1, mockUser.id);
        expect(result).toBe(true);
      });

      it('should return false when removal fails', async () => {
        commentService.remove.mockResolvedValue(false);

        const result = await resolver.remove(mockUser, 1);

        expect(result).toBe(false);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Comment not found');
        commentService.remove.mockRejectedValue(error);

        await expect(resolver.remove(mockUser, 999)).rejects.toThrow(
          'Comment not found',
        );
      });
    });
  });

  describe('Resolve Fields', () => {
    describe('user', () => {
      const mockUserEntity = {
        id: 1,
        name: 'Rodrigo Albornoz',
        email: 'rodrigo@example.com',
        password: 'hashedPassword123',
      };

      beforeEach(() => {
        userLoader.setInfo.mockReturnValue(userLoader);
        (userLoader.findUsersByUserId.load as jest.Mock).mockResolvedValue(
          mockUserEntity,
        );
      });

      it('should return user for comment', async () => {
        const result = await resolver.user(mockComment, mockGraphQLResolveInfo);

        expect(userLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
        expect(userLoader.findUsersByUserId.load).toHaveBeenCalledWith(
          mockComment.userId,
        );
        expect(result).toEqual(mockUserEntity);
      });

      it('should return null if comment is null', async () => {
        const result = await resolver.user(null as any, mockGraphQLResolveInfo);

        expect(result).toBeNull();
        expect(userLoader.setInfo).not.toHaveBeenCalled();
        expect(userLoader.findUsersByUserId.load).not.toHaveBeenCalled();
      });

      it('should return null if comment is undefined', async () => {
        const result = await resolver.user(
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toBeNull();
        expect(userLoader.setInfo).not.toHaveBeenCalled();
        expect(userLoader.findUsersByUserId.load).not.toHaveBeenCalled();
      });

      it('should throw an error if loader fails', async () => {
        const error = new Error('User not found');
        (userLoader.findUsersByUserId.load as jest.Mock).mockRejectedValue(
          error,
        );

        await expect(
          resolver.user(mockComment, mockGraphQLResolveInfo),
        ).rejects.toThrow('User not found');
      });
    });

    describe('post', () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 1,
      };

      beforeEach(() => {
        postLoader.setInfo.mockReturnValue(postLoader);
        (postLoader.findPostsByPostId.load as jest.Mock).mockResolvedValue(
          mockPost,
        );
      });

      it('should return post for comment', async () => {
        const result = await resolver.post(mockComment, mockGraphQLResolveInfo);

        expect(postLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
        expect(postLoader.findPostsByPostId.load).toHaveBeenCalledWith(
          mockComment.postId,
        );
        expect(result).toEqual(mockPost);
      });

      it('should return null if comment is null', async () => {
        const result = await resolver.post(null as any, mockGraphQLResolveInfo);

        expect(result).toBeNull();
        expect(postLoader.setInfo).not.toHaveBeenCalled();
        expect(postLoader.findPostsByPostId.load).not.toHaveBeenCalled();
      });

      it('should return null if comment is undefined', async () => {
        const result = await resolver.post(
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toBeNull();
        expect(postLoader.setInfo).not.toHaveBeenCalled();
        expect(postLoader.findPostsByPostId.load).not.toHaveBeenCalled();
      });

      it('should throw an error if loader fails', async () => {
        const error = new Error('Post not found');
        (postLoader.findPostsByPostId.load as jest.Mock).mockRejectedValue(
          error,
        );

        await expect(
          resolver.post(mockComment, mockGraphQLResolveInfo),
        ).rejects.toThrow('Post not found');
      });
    });
  });
});
