import ACTIONS from './index';
//import {io} from 'socket.io-client';

export const dispatchSetNot = notification => {
  return {
    type: ACTIONS.NOT,
    payload: {
      notification,
      //socket: io(),
    },
  };
};
