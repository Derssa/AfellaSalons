import ACTIONS from '../actions/';

const initialState = {
  salon: {},
  token: '',
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        ...state,
        salon: action.payload.salon,
        token: action.payload.token,
      };
    case ACTIONS.UPDATESALON:
      return {
        ...state,
        salon: action.payload.salon,
      };
    default:
      return state;
  }
};

export default authReducer;
