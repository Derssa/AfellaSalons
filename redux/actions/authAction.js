import ACTIONS from './index';
//import {io} from 'socket.io-client';

export const dispatchGetSalon = res => {
  return {
    type: ACTIONS.LOGIN,
    payload: {
      salon: res.data.salon,
      token: res.data.access_token,
      //socket: io(),
    },
  };
};
export const dispatchUpdateSalon = res => {
  return {
    type: ACTIONS.UPDATESALON,
    payload: {
      salon: res.data.salon,
    },
  };
};
