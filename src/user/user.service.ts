import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { GraphQLResolveInfo } from 'graphql';
import { Op } from 'sequelize';
import { buildPagination, getAttributes } from '../app.utils';
import { PaginationInput } from '../common/dto/pagination.input';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserPasswordInput } from './dto/update-user-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserAttributes, userDataMap } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async handleHashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async create(createUserInput: CreateUserInput): Promise<UserAttributes> {
    const hasUser = await this.userModel.count({
      where: {
        email: createUserInput.email,
      },
    });

    if (hasUser > 0) {
      throw new Error('User already exists');
    }

    createUserInput.password = await this.handleHashPassword(
      createUserInput.password,
    );

    const newUser = await this.userModel.create(createUserInput);

    return newUser.get({ plain: true });
  }

  async findAll(
    pagination: PaginationInput,
    info: GraphQLResolveInfo,
  ): Promise<UserAttributes[]> {
    const attributes = getAttributes(info, userDataMap);
    const paginationData = buildPagination(pagination);
    const users = await this.userModel.findAll({
      ...paginationData,
      attributes: attributes,
    });
    return users.map((user: User) => user.get({ plain: true }));
  }

  async findAllByIds(
    ids: number[],
    info: GraphQLResolveInfo,
  ): Promise<UserAttributes[]> {
    const attributes = getAttributes(info, userDataMap);
    const users = await this.userModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      attributes,
      order: [['createdAt', 'DESC']],
    });
    return users.map((user: User) => user.get({ plain: true }));
  }

  async findOne(id: number, info: GraphQLResolveInfo): Promise<UserAttributes> {
    const attributes = getAttributes(info, userDataMap);
    const user = await this.userModel.findOne({
      where: { id },
      attributes,
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.get({ plain: true });
  }

  async findOneById(id: number): Promise<UserAttributes> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user.get({ plain: true });
  }

  async findOneByEmail(email: string): Promise<UserAttributes> {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    return user.get({ plain: true });
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const res = await this.userModel.update(updateUserInput, {
      where: { id },
    });

    if (res[0] === 0) {
      throw new Error('User not found');
    }

    return this.findOneById(id);
  }

  async updatePassword(
    id: number,
    updateUserPasswordInput: UpdateUserPasswordInput,
  ) {
    const res = await this.userModel.update(updateUserPasswordInput, {
      where: { id },
    });

    updateUserPasswordInput.password = await this.handleHashPassword(
      updateUserPasswordInput.password,
    );

    return res[0] === 1;
  }

  async remove(id: number) {
    const res = await this.userModel.destroy({ where: { id } });
    return res === 1;
  }
}
