import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { CommentService } from 'src/comment/comment.service';
import { CommentAttributes } from 'src/comment/entities/comment.entity';
import { UserAttributes } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable({ scope: Scope.REQUEST })
export class PostLoader {
  constructor(
    private readonly userService: UserService,
    private readonly commentService: CommentService,
  ) {}

  // Criar o loader para comments por autor
  readonly commentsByPost = new DataLoader<number, CommentAttributes[]>(
    async (postIds: readonly number[]) => {
      // Buscar todos os comments de uma vez
      const comments = await this.commentService.findAllByPostIds([...postIds]);

      // Criar um mapa agrupando comments por postId
      const commentsMap = new Map<number, CommentAttributes[]>();

      // Inicializar com arrays vazios para cada userId
      postIds.forEach((id) => commentsMap.set(id, []));

      // Agrupar comments por postId
      comments.forEach((comment) => {
        const list = commentsMap.get(comment.postId);
        if (list) {
          list.push(comment);
        }
      });

      // Retornar na mesma ordem dos userIds
      return postIds.map((id) => commentsMap.get(id) || []);
    },
  );

  readonly authorByPost = new DataLoader<number, UserAttributes | undefined>(
    async (authorIds: readonly number[]) => {
      // Buscar todos os usuários de uma vez
      const users = await this.userService.findAllByIds([...authorIds]);

      // Criar um mapa agrupando usuários por id
      const userMap = new Map<number, UserAttributes | undefined>();

      // Inicializar com undefined para cada id
      authorIds.forEach((id) => userMap.set(id, undefined));

      // Mapear cada usuário pelo seu id
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      // Retornar na mesma ordem dos authorIds
      return authorIds.map((id) => userMap.get(id));
    },
  );
}
