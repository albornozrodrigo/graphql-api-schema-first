import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserAttributes } from 'src/user/entities/user.entity';
import { UserService } from '../user/user.service';
import { JwtPayload } from './auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<UserAttributes, 'password'> | null> {
    const user = await this.userService.findOneByEmail(email);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }

    return null;
  }

  async getUserById(userId: number) {
    return await this.userService.findOneById(userId);
  }

  login(user: Omit<UserAttributes, 'password'>) {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
