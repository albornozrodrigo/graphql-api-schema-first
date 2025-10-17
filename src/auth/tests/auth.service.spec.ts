/* eslint-disable @typescript-eslint/unbound-method */
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn((plain: string) => `hashed:${plain}`),
  compare: jest.fn(
    (plain: string, hashed: string) => hashed === `hashed:${plain}`,
  ),
  genSalt: jest.fn(() => 'salt'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(() => ({
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              password: 'password',
            })),
            findOneById: jest.fn(() => ({
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              password: 'password',
            })),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'), // Mock the sign method
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Limpar mocks após cada teste
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object if password is valid', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        expect.any(String),
      );
    });

    it('should return null if password is invalid', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(
        'test@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        expect.any(String),
      );
    });

    it('should thrown error if user is not found', async () => {
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockRejectedValue(new Error('User not found'));

      await expect(
        authService.validateUser('invalid@example.com', 'password123'),
      ).rejects.toThrow('User not found');

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        'invalid@example.com',
      );
    });
  });

  describe('login', () => {
    it('should return an access token when user is valid', () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      const expectedToken = 'token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      const result = authService.login(user);

      expect(result).toEqual({ access_token: expectedToken });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        name: user.name,
        email: user.email,
      });
    });
  });
});
