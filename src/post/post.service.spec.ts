/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../__mock__/pagination';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let postModel: {
    count: jest.Mock;
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByPk: jest.Mock;
    update: jest.Mock;
    destroy: jest.Mock;
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    authorId: 1,
    get: jest.fn().mockReturnValue({
      id: 1,
      title: 'Test Post',
      content: 'Test content',
      authorId: 1,
    }),
  };

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
        PostService,
        {
          provide: getModelToken(Post),
          useValue: {
            count: jest.fn(),
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

    service = module.get<PostService>(PostService);
    postModel = module.get(getModelToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      postModel.count.mockResolvedValue(0);
      postModel.create.mockResolvedValue(mockPost);

      const result = await service.create(mockCreatePostInput);

      expect(postModel.count).toHaveBeenCalledWith({
        where: { title: mockCreatePostInput.title },
      });
      expect(postModel.create).toHaveBeenCalledWith(mockCreatePostInput);
      expect(result).toEqual(mockPost.get());
    });

    it('should throw error when title already exists', async () => {
      postModel.count.mockResolvedValue(1);

      await expect(service.create(mockCreatePostInput)).rejects.toThrow(
        'Title already used',
      );
    });
  });

  describe('findAll', () => {
    it('should return all posts with pagination', async () => {
      const posts = [mockPost];
      postModel.findAll.mockResolvedValue(posts);

      const result = await service.findAll(
        mockPaginationInput,
        mockGraphQLResolveInfo,
      );

      expect(postModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPost.get()]);
    });
  });

  describe('findAllByAuthorId', () => {
    it('should return posts by author id', async () => {
      const posts = [mockPost];
      postModel.findAll.mockResolvedValue(posts);

      const result = await service.findAllByAuthorId(
        1,
        mockPaginationInput,
        mockGraphQLResolveInfo,
      );

      expect(postModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { authorId: 1 },
        }),
      );
      expect(result).toEqual([mockPost.get()]);
    });
  });

  describe('findAllByIds', () => {
    it('should return posts by ids', async () => {
      const posts = [mockPost];
      postModel.findAll.mockResolvedValue(posts);

      const result = await service.findAllByIds([1, 2], mockGraphQLResolveInfo);

      expect(postModel.findAll).toHaveBeenCalledWith({
        where: { id: { [Symbol.for('in')]: [1, 2] } },
        attributes: expect.any(Array),
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual([mockPost.get()]);
    });
  });

  describe('findAllByAuthorIds', () => {
    it('should return posts by author ids', async () => {
      const posts = [mockPost];
      postModel.findAll.mockResolvedValue(posts);

      const result = await service.findAllByAuthorIds(
        [1, 2],
        mockGraphQLResolveInfo,
      );

      expect(postModel.findAll).toHaveBeenCalledWith({
        where: { authorId: { [Symbol.for('in')]: [1, 2] } },
        attributes: expect.any(Array),
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual([mockPost.get()]);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      postModel.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1, mockGraphQLResolveInfo);

      expect(postModel.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: expect.any(Array),
      });
      expect(result).toEqual(mockPost.get());
    });

    it('should throw error when post not found', async () => {
      postModel.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999, mockGraphQLResolveInfo),
      ).rejects.toThrow('Post not found');
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const currentPost = {
        get: jest.fn().mockReturnValue({
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          authorId: 1,
        }),
      };
      postModel.findByPk.mockResolvedValue(currentPost);
      postModel.update.mockResolvedValue([1]);

      const result = await service.update(1, mockUpdatePostInput);

      expect(postModel.findByPk).toHaveBeenCalledWith(1);
      expect(postModel.update).toHaveBeenCalledWith(mockUpdatePostInput, {
        where: { id: 1 },
      });
      expect(result).toEqual({
        ...currentPost.get(),
        ...mockUpdatePostInput,
      });
    });

    it('should throw error when post not found', async () => {
      postModel.findByPk.mockResolvedValue(null);

      await expect(service.update(999, mockUpdatePostInput)).rejects.toThrow(
        'Post not found',
      );
    });

    it('should throw error when user is not authorized', async () => {
      const currentPost = {
        get: jest.fn().mockReturnValue({
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          authorId: 2, // Different author
        }),
      };
      postModel.findByPk.mockResolvedValue(currentPost);

      await expect(service.update(1, mockUpdatePostInput)).rejects.toThrow(
        'You are not authorized to update this post',
      );
    });

    it('should throw error when update fails', async () => {
      const currentPost = {
        get: jest.fn().mockReturnValue({
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          authorId: 1,
        }),
      };
      postModel.findByPk.mockResolvedValue(currentPost);
      postModel.update.mockResolvedValue([0]);

      await expect(service.update(1, mockUpdatePostInput)).rejects.toThrow(
        'Post not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const post = {
        authorId: 1,
      };
      postModel.findByPk.mockResolvedValue(post);
      postModel.destroy.mockResolvedValue(1);

      const result = await service.remove(1, 1);

      expect(postModel.findByPk).toHaveBeenCalledWith(1);
      expect(postModel.destroy).toHaveBeenCalledWith({
        where: { id: 1, authorId: 1 },
      });
      expect(result).toBe(true);
    });

    it('should throw error when post not found', async () => {
      postModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow('Post not found');
    });

    it('should throw error when user is not authorized', async () => {
      const post = {
        authorId: 2, // Different author
      };
      postModel.findByPk.mockResolvedValue(post);

      await expect(service.remove(1, 1)).rejects.toThrow(
        'You are not authorized to delete this post',
      );
    });

    it('should return false when removal fails', async () => {
      const post = {
        authorId: 1,
      };
      postModel.findByPk.mockResolvedValue(post);
      postModel.destroy.mockResolvedValue(0);

      const result = await service.remove(1, 1);

      expect(result).toBe(false);
    });
  });
});
