/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import { PaginationInput } from '../../common/dto/pagination.input';
import { PostLoader } from '../../post/post.loader';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserPasswordInput } from '../dto/update-user-password.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User, UserAttributes } from '../entities/user.entity';
import { UserResolver } from '../user.resolver';
import { UserService } from '../user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;
  let postLoader: jest.Mocked<PostLoader>;

  const mockUser: UserAttributes = {
    id: 1,
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'hashedPassword123',
  };

  const mockCreateUserInput: CreateUserInput = {
    name: 'Rodrigo Albornoz',
    email: 'joao@example.com',
    password: 'password123',
  };

  const mockUpdateUserInput: UpdateUserInput = {
    name: 'Rodrigo Albornoz Figueiredo',
  };

  const mockUpdateUserPasswordInput: UpdateUserPasswordInput = {
    password: 'newPassword123',
  };

  const mockPaginationInput: PaginationInput = {
    limit: 10,
    page: 1,
  };

  const mockGraphQLResolveInfo = {} as GraphQLResolveInfo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updatePassword: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PostLoader,
          useValue: {
            setInfo: jest.fn(),
            findPostsByAuthorId: {
              load: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService);
    postLoader = module.get(PostLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Queries', () => {
    describe('findAll', () => {
      it('should return all users with pagination', async () => {
        const users = [mockUser];
        userService.findAll.mockResolvedValue(users);

        const result = await resolver.findAll(
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );

        expect(userService.findAll).toHaveBeenCalledWith(
          mockPaginationInput,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(users);
      });

      it('should throw an error when database fails', async () => {
        const error = new Error('Database error');
        userService.findAll.mockRejectedValue(error);

        await expect(
          resolver.findAll(mockPaginationInput, mockGraphQLResolveInfo),
        ).rejects.toThrow('Database error');
      });
    });

    describe('findOne', () => {
      it('should return a user by id', async () => {
        userService.findOne.mockResolvedValue(mockUser);

        const result = await resolver.findOne(1, mockGraphQLResolveInfo);

        expect(userService.findOne).toHaveBeenCalledWith(
          1,
          mockGraphQLResolveInfo,
        );
        expect(result).toEqual(mockUser);
      });

      it('should throw an error when user is not found', async () => {
        const error = new Error('User not found');
        userService.findOne.mockRejectedValue(error);

        await expect(
          resolver.findOne(999, mockGraphQLResolveInfo),
        ).rejects.toThrow('User not found');
      });
    });

    describe('getAuthenticatedUser (me)', () => {
      it('should return the authenticated user', () => {
        const result = resolver.getAuthenticatedUser(mockUser);

        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('Mutations', () => {
    describe('create', () => {
      it('should create a new user', async () => {
        userService.create.mockResolvedValue(mockUser);

        const result = await resolver.create(mockCreateUserInput);

        expect(userService.create).toHaveBeenCalledWith(mockCreateUserInput);
        expect(result).toEqual(mockUser);
      });

      it('should throw an error when user already exists', async () => {
        const error = new Error('User already exists');
        userService.create.mockRejectedValue(error);

        await expect(resolver.create(mockCreateUserInput)).rejects.toThrow(
          'User already exists',
        );
      });
    });

    describe('update', () => {
      it('should update a user', async () => {
        const updatedUser = {
          ...mockUser,
          name: 'Rodrigo Albornoz Figueiredo',
        };

        userService.update.mockResolvedValue(updatedUser);

        const result = await resolver.update(mockUser, mockUpdateUserInput);

        expect(userService.update).toHaveBeenCalledWith(
          mockUser.id,
          mockUpdateUserInput,
        );

        expect(result).toEqual(updatedUser);
      });

      it('should throw an error when user is not found', async () => {
        const error = new Error('User not found');
        userService.update.mockRejectedValue(error);

        await expect(
          resolver.update(mockUser, mockUpdateUserInput),
        ).rejects.toThrow('User not found');
      });
    });

    describe('updateUserPassword', () => {
      it('should update a user password', async () => {
        userService.updatePassword.mockResolvedValue(true);

        const result = await resolver.updateUserPassword(
          mockUser,
          mockUpdateUserPasswordInput,
        );

        expect(userService.updatePassword).toHaveBeenCalledWith(
          mockUser.id,
          mockUpdateUserPasswordInput,
        );

        expect(result).toBe(true);
      });

      it('should return false when password update fails', async () => {
        userService.updatePassword.mockResolvedValue(false);

        const result = await resolver.updateUserPassword(
          mockUser,
          mockUpdateUserPasswordInput,
        );

        expect(result).toBe(false);
      });
    });

    describe('remove', () => {
      it('should remove a user', async () => {
        userService.remove.mockResolvedValue(true);

        const result = await resolver.remove(mockUser);

        expect(userService.remove).toHaveBeenCalledWith(mockUser.id);
        expect(result).toBe(true);
      });

      it('should return false when user removal fails', async () => {
        userService.remove.mockResolvedValue(false);

        const result = await resolver.remove(mockUser);

        expect(result).toBe(false);
      });
    });
  });

  describe('Resolve Fields', () => {
    describe('posts', () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          authorId: 1,
        },
        {
          id: 2,
          title: 'Post 2',
          content: 'Content 2',
          authorId: 1,
        },
      ];

      const mockUserEntity = {
        id: 1,
        name: 'Rodrigo Albornoz',
        email: 'rodrigo@example.com',
        password: 'hashedPassword123',
      } as User;

      beforeEach(() => {
        postLoader.setInfo.mockReturnValue(postLoader);
        (postLoader.findPostsByAuthorId.load as jest.Mock).mockResolvedValue(
          mockPosts,
        );
      });

      it('should return posts without pagination', async () => {
        const result = await resolver.posts(
          mockUserEntity,
          undefined as any, // PaginationInput
          mockGraphQLResolveInfo,
        );

        expect(postLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
        expect(postLoader.findPostsByAuthorId.load).toHaveBeenCalledWith(
          mockUserEntity.id,
        );
        expect(result).toEqual(mockPosts);
      });

      it('should return posts with pagination', async () => {
        const pagination = { limit: 1, page: 1 };
        const result = await resolver.posts(
          mockUserEntity,
          pagination,
          mockGraphQLResolveInfo,
        );

        expect(postLoader.setInfo).toHaveBeenCalledWith(mockGraphQLResolveInfo);
        expect(postLoader.findPostsByAuthorId.load).toHaveBeenCalledWith(
          mockUserEntity.id,
        );
        expect(result).toEqual([mockPosts[0]]);
      });

      it('should return an empty array if user is null', async () => {
        const result = await resolver.posts(
          null as any,
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toEqual([]);
        expect(postLoader.setInfo).not.toHaveBeenCalled();
        expect(postLoader.findPostsByAuthorId.load).not.toHaveBeenCalled();
      });

      it('should return an empty array if user is undefined', async () => {
        const result = await resolver.posts(
          undefined as any,
          undefined as any,
          mockGraphQLResolveInfo,
        );

        expect(result).toEqual([]);
        expect(postLoader.setInfo).not.toHaveBeenCalled();
        expect(postLoader.findPostsByAuthorId.load).not.toHaveBeenCalled();
      });

      it('should throw an error if loader fails', async () => {
        const error = new Error('Posts not found');
        (postLoader.findPostsByAuthorId.load as jest.Mock).mockRejectedValue(
          error,
        );

        await expect(
          resolver.posts(
            mockUserEntity,
            undefined as any,
            mockGraphQLResolveInfo,
          ),
        ).rejects.toThrow('Posts not found');
      });
    });
  });
});
