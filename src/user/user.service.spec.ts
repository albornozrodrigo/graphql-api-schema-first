/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLResolveInfo } from 'graphql';
import '../__mock__/pagination';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userModel: {
    count: jest.Mock;
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByPk: jest.Mock;
    update: jest.Mock;
    destroy: jest.Mock;
  };

  const mockUser = {
    id: 1,
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
    password: 'hashedPassword123',
    get: jest.fn().mockReturnValue({
      id: 1,
      name: 'Rodrigo Albornoz',
      email: 'rodrigo@example.com',
      password: 'hashedPassword123',
    }),
  };

  const mockCreateUserInput: CreateUserInput = {
    name: 'Rodrigo Albornoz',
    email: 'rodrigo@example.com',
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
        UserService,
        {
          provide: getModelToken(User),
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

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      userModel.count.mockResolvedValue(0);
      userModel.create.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserInput);

      expect(userModel.count).toHaveBeenCalledWith({
        where: { email: mockCreateUserInput.email },
      });

      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockCreateUserInput.name,
          email: mockCreateUserInput.email,
        }),
      );

      expect(result).toEqual(mockUser.get());
    });

    it('should throw error when user already exists', async () => {
      userModel.count.mockResolvedValue(1);

      await expect(service.create(mockCreateUserInput)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const users = [mockUser];
      userModel.findAll.mockResolvedValue(users);

      const result = await service.findAll(
        mockPaginationInput,
        mockGraphQLResolveInfo,
      );

      expect(userModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser.get()]);
    });
  });

  describe('findAllByIds', () => {
    it('should return users by ids', async () => {
      const users = [mockUser];
      userModel.findAll.mockResolvedValue(users);

      const result = await service.findAllByIds([1, 2], mockGraphQLResolveInfo);

      expect(userModel.findAll).toHaveBeenCalledWith({
        where: { id: { [Symbol.for('in')]: [1, 2] } },
        attributes: expect.any(Array),
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual([mockUser.get()]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      userModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1, mockGraphQLResolveInfo);

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: expect.any(Array),
      });
      expect(result).toEqual(mockUser.get());
    });

    it('should throw error when user not found', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999, mockGraphQLResolveInfo),
      ).rejects.toThrow('User not found');
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      userModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.findOneById(1);

      expect(userModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser.get());
    });

    it('should throw error when user not found', async () => {
      userModel.findByPk.mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toThrow('User not found');
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      userModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('rodrigo@example.com');

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: 'rodrigo@example.com' },
      });
      expect(result).toEqual(mockUser.get());
    });

    it('should throw error when user not found', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByEmail('notfound@example.com'),
      ).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Rodrigo Albornoz Figueiredo' };
      userModel.update.mockResolvedValue([1]);
      userModel.findByPk.mockResolvedValue(updatedUser);

      const result = await service.update(1, mockUpdateUserInput);

      expect(userModel.update).toHaveBeenCalledWith(mockUpdateUserInput, {
        where: { id: 1 },
      });
      expect(result).toEqual(updatedUser.get());
    });

    it('should throw error when user not found', async () => {
      userModel.update.mockResolvedValue([0]);

      await expect(service.update(999, mockUpdateUserInput)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      userModel.update.mockResolvedValue([1]);

      const result = await service.updatePassword(
        1,
        mockUpdateUserPasswordInput,
      );

      expect(userModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.any(String),
        }),
        { where: { id: 1 } },
      );
      expect(result).toBe(true);
    });

    it('should return false when update fails', async () => {
      userModel.update.mockResolvedValue([0]);

      const result = await service.updatePassword(
        1,
        mockUpdateUserPasswordInput,
      );

      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      userModel.destroy.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(userModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false when removal fails', async () => {
      userModel.destroy.mockResolvedValue(0);

      const result = await service.remove(1);

      expect(result).toBe(false);
    });
  });

  describe('handleHashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const result = await service.handleHashPassword(password);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(password);
    });
  });
});
