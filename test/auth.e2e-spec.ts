/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';

describe('Auth', () => {
  let app: INestApplication;
  const authService = { login: () => ({ access_token: 'token' }) };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule, SequelizeModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`/GET cats`, () => {
    const query = {
      mutation: `{
        login(authInput: { email: "rodrigo@teste6.com", password: "teste" } ) {
            access_token
        },
      }`,
    };

    return request(app.getHttpServer()).post('/graphql').send(query).expect({
      data: authService.login(),
    });
  });
});
