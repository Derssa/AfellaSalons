import {combineReducers} from 'redux';
import auth from './authReducer.js';
import not from './notReducer.js';
import posts from './postsReducer.js';

export default combineReducers({
  auth,
  not,
  posts,
});
