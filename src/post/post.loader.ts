import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PostAttributes } from './entities/post.entity';
import { PostService } from './post.service';

@Injectable({ scope: Scope.REQUEST })
export class PostLoader {
  constructor(private readonly postService: PostService) {}

  readonly findPostsByPostId = new DataLoader<number, PostAttributes>(
    async (postIds: readonly number[]) => {
      const posts = await this.postService.findAllByIds([...postIds]);

      const postsMap = new Map<number, PostAttributes>();
      posts.forEach((post) => {
        postsMap.set(post.id, post);
      });

      // IMPORTANTE: Retornar na mesma ordem e lançar erro se não encontrar
      return postIds.map((id) => {
        const post = postsMap.get(id);
        if (!post) {
          throw new Error(`Post with id ${id} not found`);
        }
        return post;
      });
    },
  );

  readonly findPostsByAuthorId = new DataLoader<number, PostAttributes[]>(
    async (authorIds: readonly number[]) => {
      // Buscar todos os posts de uma vez
      const posts = await this.postService.findAllByAuthorIds([...authorIds]);

      // Criar um mapa agrupando posts por authorId
      const postsMap = new Map<number, PostAttributes[]>();

      // Inicializar com arrays vazios para cada userId
      authorIds.forEach((id) => postsMap.set(id, []));

      // Agrupar posts por authorId
      posts.forEach((post) => {
        const list = postsMap.get(post.authorId);
        if (list) {
          list.push(post);
        }
      });

      // Retornar na mesma ordem dos userIds
      return authorIds.map((id) => postsMap.get(id) || []);
    },
  );
}
