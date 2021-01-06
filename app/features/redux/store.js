// @flow

import { createStore } from 'redux';
import { persistReducer } from 'redux-persist';
import Thunk from 'redux-thunk';

import middleware from './middleware';
import reducers from './reducers';

import MiddlewareRegistry from './MiddlewareRegistry';
import PersistenceRegistry from './PersistenceRegistry';
import ReducerRegistry from './ReducerRegistry';
import StateListenerRegistry from './StateListenerRegistry';

const persistConfig = {
    key: 'root',
    storage: window.jitsiNodeAPI.createElectronStorage(),
    whitelist: [
        'onboarding',
        'recentList',
        'settings'
    ]
};

const persistedReducer = persistReducer(persistConfig, reducers);

/**
 * Initializes a new redux store instance suitable for use by this
 * {@code AbstractApp}.
 *
 * @private
 * @returns {Store} - A new redux store instance suitable for use by
 * this {@code AbstractApp}.
 */
const _createStore = () => {
    // Create combined reducer from all reducers in ReducerRegistry.
    const reducer = ReducerRegistry.combineReducers();

    // Apply all registered middleware from the MiddlewareRegistry and
    // additional 3rd party middleware:
    // - Thunk - allows us to dispatch async actions easily. For more info
    // @see https://github.com/gaearon/redux-thunk.
    let middleware = MiddlewareRegistry.applyMiddleware(Thunk);

    // Try to enable Redux DevTools Chrome extension in order to make it
    // available for the purposes of facilitating development.
    let devToolsExtension;

    if (typeof window === 'object'
            && (devToolsExtension = window.devToolsExtension)) {
        middleware = compose(middleware, devToolsExtension());
    }

    const store = createStore(
        reducer, PersistenceRegistry.getPersistedState(), middleware);

    // StateListenerRegistry
    StateListenerRegistry.subscribe(store);

    // This is temporary workaround to be able to dispatch actions from
    // non-reactified parts of the code (conference.js for example).
    // Don't use in the react code!!!
    // FIXME: remove when the reactification is finished!
    if (typeof APP !== 'undefined') {
        APP.store = store;
    }

    return store;
}

export default _createStore;
