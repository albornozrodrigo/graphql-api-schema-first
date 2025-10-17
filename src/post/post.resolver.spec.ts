/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../__mock__/pagination';
import { CommentLoader } from '../comment/comment.loader';
import { PaginationInput } from '../common/dto/pagination.input';
import { UserAttributes } from '../user/entities/user.entity';
import { UserLoader } from '../user/user.loader';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

describe('PostResolver', () => {
  let resolver: PostResolver;
  let postService: jest.Mocked<PostService>;
  let userLoader: jest.Mocked<UserLoader>;
  let commentLoader: jest.Mocked<CommentLoader>;

  const mockUser: UserAttributes = {
    id: 1,
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'hashedPassword123',
  };

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    authorId: 1,
  } as Post;

  const mockCreatePostInput: CreatePostInput = {
    title: 'Test Post',
    content: 'Test content',
    authorId: 1,
  };

  const mockUpdatePostInput: UpdatePostInput = {
    title: 'Updated Post',
    content: 'Updated content',
    authorId: 1,
  };

  const mockPaginationInput: PaginationInput = {
    limit: 10,
    page: 1,
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostResolver,
        {
          provide: PostService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findAllByAuthorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
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
        {
          provide: CommentLoader,
          useValue: {
            setInfo: jest.fn(),
            findCommentsByPostId: {
              load: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    resolver = module.get<PostResolver>(PostResolver);
    postService = module.get(PostService);
    userLoader = module.get(UserLoader);
    commentLoader = module.get(CommentLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Queries', () => {
    describe('findAll', () => {
      it('should return all posts with pagination', async () => {
        const posts = [mockPost];
        postService.findAll.mockResolvedValue(posts);

        const result = await resolver.findAll(
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );

        expect(postService.findAll).toHaveBeenCalledWith(
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(posts);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Database error');
        postService.findAll.mockRejectedValue(error);

        await expect(
          resolver.findAll(mockPaginationInput, mockGraphQLResolveInfo),
        ).rejects.toThrow('Database error');
      });
    });

    describe('findOne', () => {
      it('should return a post by id', async () => {
        postService.findOne.mockResolvedValue(mockPost);

        const result = await resolver.findOne(1, mockGraphQLResolveInfo);

        expect(postService.findOne).toHaveBeenCalledWith(
          1,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(mockPost);
      });

      it('should throw an error when post not found', async () => {
        const error = new Error('Post not found');
        postService.findOne.mockRejectedValue(error);

        await expect(
          resolver.findOne(999, mockGraphQLResolveInfo),
        ).rejects.toThrow('Post not found');
      });
    });

    describe('findAllByAuthorId', () => {
      it('should return posts by author id', async () => {
        const posts = [mockPost];
        postService.findAllByAuthorId.mockResolvedValue(posts);

        const result = await resolver.findAllByAuthorId(
          mockUser,
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );

        expect(postService.findAllByAuthorId).toHaveBeenCalledWith(
          mockUser.id,
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(posts);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Author not found');
        postService.findAllByAuthorId.mockRejectedValue(error);

        await expect(
          resolver.findAllByAuthorId(
            mockUser,
            mockPaginationInput,
            mockGraphQLResolveInfo,
          ),
        ).rejects.toThrow('Author not found');
      });
    });
  });

  describe('Mutations', () => {
    describe('create', () => {
      it('should create a new post', async () => {
        const inputWithoutAuthorId = {
          title: 'Test Post',
          content: 'Test content',
          authorId: 0, // Will be overridden by resolver
        };
        postService.create.mockResolvedValue(mockPost);

        const result = await resolver.create(mockUser, inputWithoutAuthorId);

        expect(postService.create).toHaveBeenCalledWith({
          ...inputWithoutAuthorId,
          authorId: mockUser.id,
        });
        expect(result).toEqual(mockPost);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Title already used');
        postService.create.mockRejectedValue(error);

        await expect(
          resolver.create(mockUser, mockCreatePostInput),
        ).rejects.toThrow('Title already used');
      });
    });

    describe('update', () => {
      it('should update a post', async () => {
        const inputWithoutAuthorId = {
          title: 'Updated Post',
          content: 'Updated content',
        };
        const updatedPost = { ...mockPost, title: 'Updated Post' };
        postService.update.mockResolvedValue(updatedPost);

        const result = await resolver.update(mockUser, 1, inputWithoutAuthorId);

        expect(postService.update).toHaveBeenCalledWith(1, {
          ...inputWithoutAuthorId,
          authorId: mockUser.id,
        });
        expect(result).toEqual(updatedPost);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Post not found');
        postService.update.mockRejectedValue(error);

        await expect(
          resolver.update(mockUser, 999, mockUpdatePostInput),
        ).rejects.toThrow('Post not found');
      });
    });

    describe('remove', () => {
      it('should remove a post', async () => {
        postService.remove.mockResolvedValue(true);

        const result = await resolver.remove(mockUser, 1);

        expect(postService.remove).toHaveBeenCalledWith(1, mockUser.id);
        expect(result).toBe(true);
      });

      it('should return false when removal fails', async () => {
        postService.remove.mockResolvedValue(false);

        const result = await resolver.remove(mockUser, 1);

        expect(result).toBe(false);
      });

      it('should throw an error when service fails', async () => {
        const error = new Error('Post not found');
        postService.remove.mockRejectedValue(error);

        await expect(resolver.remove(mockUser, 999)).rejects.toThrow(
          'Post not found',
        );
      });
    });
  });

  describe('Resolve Fields', () => {
    describe('author', () => {
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

      it('should return author for post', async () => {
        const result = await resolver.author(mockPost, mockGraphQLResolveInfo);

        expect(userLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
        expect(userLoader.findUsersByUserId.load).toHaveBeenCalledWith(
          mockPost.authorId,
        );
        expect(result).toEqual(mockUserEntity);
      });

      it('should return null if post is null', async () => {
        const result = await resolver.author(
          null as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toBeNull();
        expect(userLoader.setInfo).not.toHaveBeenCalled();
        expect(userLoader.findUsersByUserId.load).not.toHaveBeenCalled();
      });

      it('should return null if post is undefined', async () => {
        const result = await resolver.author(
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
          resolver.author(mockPost, mockGraphQLResolveInfo),
        ).rejects.toThrow('User not found');
      });
    });

    describe('comments', () => {
      const mockComments = [
        {
          id: 1,
          comment: 'Comment 1',
          postId: 1,
          userId: 1,
        },
        {
          id: 2,
          comment: 'Comment 2',
          postId: 1,
          userId: 2,
        },
      ];

      beforeEach(() => {
        commentLoader.setInfo.mockReturnValue(commentLoader);
        (
          commentLoader.findCommentsByPostId.load as jest.Mock
        ).mockResolvedValue(mockComments);
      });

      it('should return comments without pagination', async () => {
        const result = await resolver.comments(
          mockPost,
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(commentLoader.setInfo).toHaveBeenCalledWith(
          mockGraphQLResolveInfo,
        );
        expect(commentLoader.findCommentsByPostId.load).toHaveBeenCalledWith(
          mockPost.id,
        );
        expect(result).toEqual(mockComments);
      });

      it('should return comments with pagination', async () => {
        const pagination = { limit: 1, page: 1 };
        const result = await resolver.comments(
          mockPost,
          pagination,
          mockGraphQLResolveInfo,
        );

        expect(commentLoader.setInfo).toHaveBeenCalledWith(
          mockGraphQLResolveInfo,
        );
        expect(commentLoader.findCommentsByPostId.load).toHaveBeenCalledWith(
          mockPost.id,
        );
        expect(result).toEqual([mockComments[0]]);
      });

      it('should return empty array if post is null', async () => {
        const result = await resolver.comments(
          null as any,
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toEqual([]);
        expect(commentLoader.setInfo).not.toHaveBeenCalled();
        expect(commentLoader.findCommentsByPostId.load).not.toHaveBeenCalled();
      });

      it('should return empty array if post is undefined', async () => {
        const result = await resolver.comments(
          undefined as any,
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toEqual([]);
        expect(commentLoader.setInfo).not.toHaveBeenCalled();
        expect(commentLoader.findCommentsByPostId.load).not.toHaveBeenCalled();
      });

      it('should throw an error if loader fails', async () => {
        const error = new Error('Comments not found');
        (
          commentLoader.findCommentsByPostId.load as jest.Mock
        ).mockRejectedValue(error);

        await expect(
          resolver.comments(mockPost, undefined as any, mockGraphQLResolveInfo),
        ).rejects.toThrow('Comments not found');
      });
    });
  });
});
