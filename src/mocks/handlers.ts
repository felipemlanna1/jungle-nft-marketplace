import { socketHandler } from './handlers/events';
import { catalogHandlers } from './handlers/catalog';
import { sessionHandlers } from './handlers/session';
import { accountHandlers } from './handlers/account';
import { cartHandlers } from './handlers/cart';
import { ordersHandlers } from './handlers/orders';
import { demoHandlers } from './handlers/demo';
import { recommendationHandlers } from './handlers/recommendations';
import { newsletterHandlers } from './handlers/newsletter';
import { articleHandlers } from './handlers/articles';

export const handlers = [
  socketHandler,
  ...catalogHandlers,
  ...recommendationHandlers,
  ...newsletterHandlers,
  ...articleHandlers,
  ...sessionHandlers,
  ...accountHandlers,
  ...cartHandlers,
  ...ordersHandlers,
  ...demoHandlers,
];
