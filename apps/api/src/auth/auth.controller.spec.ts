import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn((dto) => {
      return Promise.resolve({ access_token: 'mock_jwt_token', user: dto });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct params and return a token', async () => {
      const mockLoginDto = { user_id: 'testuser', password: 'password123' };

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual({
        access_token: 'mock_jwt_token',
        user: mockLoginDto,
      });
    });
  });
});
