import ACTIONS from './index';

export const dispatchGetPosts = res => {
  return {
    type: ACTIONS.POSTS,
    payload: {
      posts: res.data.posts,
    },
  };
};
