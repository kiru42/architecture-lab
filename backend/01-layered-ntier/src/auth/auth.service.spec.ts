import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return user with token', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
      };

      const hashedPassword = 'hashed_password';
      const createdUser = {
        id: '1',
        email: signupDto.email,
        name: signupDto.name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = 'jwt_token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.signup(signupDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: signupDto.email,
          password: hashedPassword,
          name: signupDto.name,
        },
      });
      expect(result).toEqual({
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          createdAt: createdUser.createdAt,
        },
        token,
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const signupDto = {
        email: 'existing@example.com',
        password: 'SecurePass123',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it('should authenticate user and return user with token', async () => {
      const signinDto = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const user = {
        id: '1',
        email: signinDto.email,
        name: 'Test User',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = 'jwt_token';

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.signin(signinDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: signinDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(signinDto.password, user.password);
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const signinDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signin(signinDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const signinDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const user = {
        id: '1',
        email: signinDto.email,
        password: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(signinDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      const userId = '1';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
