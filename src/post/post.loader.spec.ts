/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../__mock__/pagination';
import { PostLoader } from './post.loader';
import { PostService } from './post.service';

describe('PostLoader', () => {
  let loader: PostLoader;
  let postService: jest.Mocked<PostService>;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    authorId: 1,
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostLoader,
        {
          provide: PostService,
          useValue: {
            findAllByIds: jest.fn(),
            findAllByAuthorIds: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = await module.resolve<PostLoader>(PostLoader);
    postService = module.get(PostService);
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

  describe('findPostsByPostId', () => {
    beforeEach(() => {
      loader.setInfo(mockGraphQLResolveInfo);
    });

    it('should load single post by id', async () => {
      const postId = 1;
      const post = { ...mockPost };

      postService.findAllByIds.mockResolvedValue([post]);

      const result = await loader.findPostsByPostId.load(postId);

      expect(postService.findAllByIds).toHaveBeenCalledWith(
        [postId],
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(post);
    });

    it('should cache results for same post id', async () => {
      const postId = 1;
      const post = { ...mockPost };

      postService.findAllByIds.mockResolvedValue([post]);

      // First call
      const result1 = await loader.findPostsByPostId.load(postId);

      // Second call should use cache
      const result2 = await loader.findPostsByPostId.load(postId);

      expect(postService.findAllByIds).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(post);
      expect(result2).toEqual(post);
    });
  });

  describe('findPostsByAuthorId', () => {
    beforeEach(() => {
      loader.setInfo(mockGraphQLResolveInfo);
    });

    it('should load posts for single author id', async () => {
      const authorId = 1;
      const posts = [
        { ...mockPost, id: 1, authorId: 1 },
        { ...mockPost, id: 2, authorId: 1, title: 'Post 2' },
      ];

      postService.findAllByAuthorIds.mockResolvedValue(posts);

      const result = await loader.findPostsByAuthorId.load(authorId);

      expect(postService.findAllByAuthorIds).toHaveBeenCalledWith(
        [authorId],
        mockGraphQLResolveInfo,
      );

      expect(result).toEqual(posts);
    });

    it('should cache results for same author id', async () => {
      const authorId = 1;
      const posts = [
        { ...mockPost, id: 1, authorId: 1 },
        { ...mockPost, id: 2, authorId: 1, title: 'Post 2' },
      ];

      postService.findAllByAuthorIds.mockResolvedValue(posts);

      // First call
      const result1 = await loader.findPostsByAuthorId.load(authorId);

      // Second call should use cache
      const result2 = await loader.findPostsByAuthorId.load(authorId);

      expect(postService.findAllByAuthorIds).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(posts);
      expect(result2).toEqual(posts);
    });
  });
});
