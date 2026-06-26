import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth System (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Enables DTO validation testing
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.user.deleteMany(); // Clear users before running tests
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/auth/signup (POST) -> should register a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toEqual('test@example.com');
      });
  });

  it('/auth/signin (POST) -> should return a JWT token for valid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });
  });
});
