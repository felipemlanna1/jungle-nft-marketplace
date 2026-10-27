import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { database, session, subscribeMockEvents } from '../database';

const origin = typeof location !== 'undefined' ? location.origin : 'http://localhost:5173';

const socketUrl = origin.replace(/^http/, 'ws') + '/marketplace-events/';

const channel = ws.link(socketUrl);

export const socketHandler = channel.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);
  const socketUser = new URL(connection.client.url).searchParams.get('userId');
  const remove = subscribeMockEvents((type, data, userId) => {
    const current = session(database(), false);
    if (socketUser && current?.id !== socketUser) return;
    if (userId && (!socketUser || socketUser !== userId)) return;
    io.client.emit(type, data);
  });
  connection.client.addEventListener('close', remove);
  connection.client.addEventListener('message', (event) => {
    // Engine.IO heartbeat is maintained in the network mock, not in application components.
    if (event.data === '2') connection.client.send('3');
  });
});
