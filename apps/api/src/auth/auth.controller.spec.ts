import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  const mockAuthService = {
    login: jest.fn((_dto, _res) =>
      Promise.resolve({ user_id: 'testuser' }),
    ),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('delegates to authService.login and returns user_id', async () => {
      const dto = { user_id: 'testuser', password: 'password123' };
      const result = await controller.login(dto, mockRes);
      expect(authService.login).toHaveBeenCalledWith(dto, mockRes);
      expect(result).toEqual({ user_id: 'testuser' });
    });
  });
});
