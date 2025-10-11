import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { buildPagination } from 'src/app.utils';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserAttributes } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    return await this.userModel.create(createUserInput);
  }

  async findAll(pagination: PaginationInput): Promise<UserAttributes[]> {
    const paginationData = buildPagination(pagination);
    const users = await this.userModel.findAll(paginationData);
    return users.map((user: User) => user.get({ plain: true }));
  }

  async findOne(id: number) {
    return await this.userModel.findByPk(id);
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const res = await this.userModel.update(updateUserInput, {
      where: { id },
    });

    if (res[0] === 0) {
      throw new Error('User not found');
    }

    return this.userModel.findByPk(id);
  }

  async updatePassword(
    id: number,
    updateUserPasswordInput: UpdateUserPasswordInput,
  ) {
    const res = await this.userModel.update(updateUserPasswordInput, {
      where: { id },
    });

    return res[0] === 1;
  }

  async remove(id: number) {
    const res = await this.userModel.destroy({ where: { id } });
    return res === 1;
  }
}
