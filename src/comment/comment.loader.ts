import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';
import { CommentService } from './comment.service';
import { CommentAttributes } from './entities/comment.entity';

@Injectable({ scope: Scope.REQUEST })
export class CommentLoader {
  private info: GraphQLResolveInfo;
  constructor(private readonly commentService: CommentService) {}

  setInfo(info: GraphQLResolveInfo) {
    this.info = info;
    return this;
  }

  // Criar o loader para comments por autor
  readonly findCommentsByPostId = new DataLoader<number, CommentAttributes[]>(
    async (postIds: readonly number[]) => {
      // Buscar todos os comments de uma vez
      const comments = await this.commentService.findAllByPostIds(
        [...postIds],
        this.info,
      );

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

      // Retornar na mesma ordem dos postIds
      return postIds.map((id) => commentsMap.get(id) || []);
    },
  );

  // Criar o loader para comments por autor
  readonly findCommentsByUserId = new DataLoader<number, CommentAttributes[]>(
    async (userIds: readonly number[]) => {
      // Buscar todos os comments de uma vez
      const comments = await this.commentService.findAllByUserIds(
        [...userIds],
        this.info,
      );

      // Criar um mapa agrupando comments por postId
      const commentsMap = new Map<number, CommentAttributes[]>();

      // Inicializar com arrays vazios para cada userId
      userIds.forEach((id) => commentsMap.set(id, []));

      // Agrupar comments por postId
      comments.forEach((comment) => {
        const list = commentsMap.get(comment.userId);
        if (list) {
          list.push(comment);
        }
      });

      // Retornar na mesma ordem dos userIds
      return userIds.map((id) => commentsMap.get(id) || []);
    },
  );
}
