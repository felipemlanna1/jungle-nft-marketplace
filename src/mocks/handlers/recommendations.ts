import { http } from 'msw';
import { recommendNfts } from '../../domain/recommendations';
import { ApiError, database } from '../database';
import { json, route } from './network';

export const recommendationHandlers = [
  http.get(
    '/api/recommendations',
    route(({ request }) => {
      const params = new URL(request.url).searchParams;
      if ([...params.keys()].some((key) => !['exclude', 'limit'].includes(key)))
        throw new ApiError('Use only exclude and limit for recommendations.');
      if (params.getAll('exclude').length > 1 || params.getAll('limit').length > 1)
        throw new ApiError('Recommendation parameters must not be repeated.');
      const rawLimit = params.get('limit') ?? '8';
      if (!/^(?:[1-9]|1[0-2])$/.test(rawLimit))
        throw new ApiError('Choose a recommendation limit from 1 to 12.');
      const rawExclude = params.get('exclude');
      const exclude = rawExclude === null ? [] : rawExclude.split(',');
      if (
        exclude.length > 30 ||
        exclude.some((id) => !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/.test(id))
      )
        throw new ApiError('Supply at most 30 valid NFT identifiers to exclude.');
      const db = database();
      return json(
        recommendNfts(db.scenario === 'empty' ? [] : db.nfts, {
          exclude,
          limit: Number(rawLimit),
        }),
      );
    }),
  ),
];
