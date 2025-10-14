import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';
import { UserAttributes } from './entities/user.entity';
import { UserService } from './user.service';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  private info: GraphQLResolveInfo;

  constructor(private readonly userService: UserService) {}

  setInfo(info: GraphQLResolveInfo) {
    this.info = info;
    return this;
  }

  readonly findUsersByUserId = new DataLoader<number, UserAttributes>(
    async (userIds: readonly number[]) => {
      // Buscar todos os usuários de uma vez
      const users = await this.userService.findAllByIds(
        [...userIds],
        this.info,
      );

      // Criar um mapa agrupando usuários por id
      const userMap = new Map<number, UserAttributes>();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      // IMPORTANTE: Retornar na mesma ordem e lançar erro se não encontrar
      return userIds.map((id: number) => {
        const user = userMap.get(id);
        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }
        return user;
      });
    },
  );
}
