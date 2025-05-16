export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
} from './user.controller';

export {
  createWatch,
  getWatches,
  getWatchBySlug,
  getPublicWatches,
  getPublicWatchBySlug,
  updateWatch,
  deleteWatch,
} from './watch.controller';

export {
  getAdapters,
  createAdapter,
  updateAdapter,
  deleteAdapter,
} from './adapter.controller';
