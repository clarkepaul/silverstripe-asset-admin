/**
 * @file The reducer which operates on the Redux store.
 */

import { combineReducers } from 'redux';
import galleryReducer from './gallery/reducer.js';

/**
 * Operates on the Redux store to update application state.
 *
 * @param object state - The current state.
 * @param object action - The dispatched action.
 * @param string action.type - The type of action that has been dispatched.
 * @param object [action.payload] - Optional data passed with the action.
 */
const rootReducer = combineReducers({
    assetAdmin: combineReducers({
        gallery: galleryReducer
    })
});

export default rootReducer;
