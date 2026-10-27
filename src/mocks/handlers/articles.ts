import { http } from 'msw';
import { articles } from '../articles';
import { ApiError, database } from '../database';
import { idParam, json, route } from './network';

export const articleHandlers = [
  http.get(
    '/api/articles',
    route(() =>
      json(
        database().scenario === 'empty'
          ? []
          : articles.map(({ paragraphs: _paragraphs, ...preview }) => preview),
      ),
    ),
  ),
  http.get(
    '/api/articles/:id',
    route(({ params }) => {
      const article = articles.find((item) => item.id === idParam(params));
      if (!article) throw new ApiError('Artigo de demonstração não encontrado.', 404, 'NOT_FOUND');
      return json(article);
    }),
  ),
];
