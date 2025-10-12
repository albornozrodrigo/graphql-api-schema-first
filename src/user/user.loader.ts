import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PostAttributes } from 'src/post/entities/post.entity';
import { PostService } from 'src/post/post.service';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(private readonly postService: PostService) {}

  // Criar o loader para posts por autor
  readonly postsByAuthor = new DataLoader<number, PostAttributes[]>(
    async (userIds: readonly number[]) => {
      // Buscar todos os posts de uma vez
      const posts = await this.postService.findAllByAuthorIds([...userIds]);

      // Criar um mapa agrupando posts por authorId
      const postsMap = new Map<number, PostAttributes[]>();

      // Inicializar com arrays vazios para cada userId
      userIds.forEach((id) => postsMap.set(id, []));

      // Agrupar posts por authorId
      posts.forEach((post) => {
        const list = postsMap.get(post.authorId);
        if (list) {
          list.push(post);
        }
      });

      // Retornar na mesma ordem dos userIds
      return userIds.map((id) => postsMap.get(id) || []);
    },
  );
}
