import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from '../user/user.module';
import { jwtSecret } from './auth.constants';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1y' },
    }),
    SequelizeModule.forFeature([User]),
  ],
  providers: [AuthService, UserService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
