/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { Includeable } from 'sequelize';
import { Comment } from './comment/entities/comment.entity';
import { PaginationInput } from './common/dto/pagination.input';
import { Post } from './post/entities/post.entity';
import { User } from './user/entities/user.entity';

interface AttributesResult {
  attributes: string[]; // Colunas diretas da tabela principal
  include?: Includeable[]; // Relacionamentos (nested fields)
}

export const buildPagination = (pagination: PaginationInput) => {
  const limit = pagination?.limit || 10;
  const page = pagination?.page || 1;
  const offset = (page - 1) * limit;
  return { offset, limit };
};

export const getAttributes = (
  info: GraphQLResolveInfo,
  columnMap: Record<string, string>,
) => {
  const fields = graphqlFields(info);

  const attributes = Object.keys(fields)
    .filter((field) => field in columnMap)
    .map((field) => columnMap[field]);

  if (!attributes.includes('id')) {
    attributes.push('id');
  }

  return attributes;
};

export const getAttributesAdvanced = (
  info: GraphQLResolveInfo,
  columnMap: Record<string, string>,
): AttributesResult => {
  const fields = graphqlFields(info);

  const attributes: string[] = [];
  const relations: Includeable[] = [];

  Object.keys(fields).forEach((field) => {
    // Ignorar __typename
    if (field === '__typename') {
      return;
    }

    const fieldValue = fields[field];

    // Verificar se é um campo direto ou um relacionamento
    if (typeof fieldValue === 'object' && fieldValue !== null) {
      const nestedKeys = Object.keys(fieldValue);

      if (nestedKeys.length === 0) {
        // Campo direto sem nested fields
        if (field in columnMap) {
          attributes.push(columnMap[field]);
        }
      } else {
        // É um relacionamento (nested field)
        const relationFields = nestedKeys
          .filter((key) => key !== '__typename')
          .map((key) => key); // Manter os nomes originais dos campos do relacionamento

        // Sempre incluir 'id' no relacionamento se não foi explicitamente solicitado
        if (!relationFields.includes('id')) {
          relationFields.unshift('id');
        }

        relations.push({
          as: field,
          model:
            field === 'posts' ? Post : field === 'comments' ? Comment : User,
          attributes: relationFields,
        });
      }
    } else {
      // Campo direto
      if (field in columnMap) {
        attributes.push(columnMap[field]);
      }
    }
  });

  // Sempre incluir 'id' na entidade principal se não foi explicitamente solicitado
  if (!attributes.includes('id')) {
    attributes.push('id');
  }

  const result: AttributesResult = { attributes };

  if (relations.length > 0) {
    result.include = relations;
  }

  return result;
};
