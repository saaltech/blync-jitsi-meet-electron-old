// @flow

// import { SET_CONFIG } from '../base/config';
import MiddlewareRegistry from '../redux/MiddlewareRegistry';

import { REFRESH_CALENDAR } from './actionTypes';
import { setCalendarAuthorization } from './actions';
import { _fetchCalendarEntries, isCalendarEnabled } from './functions';

MiddlewareRegistry.register(store => next => action => {
    const { getState } = store;

    if (!isCalendarEnabled(getState)) {
        return next(action);
    }

    switch (action.type) {

    // case SET_CONFIG: {
    //     const result = next(action);

    //     _fetchCalendarEntries(store, false, false);

    //     return result;
    // }

    case REFRESH_CALENDAR: {
        const result = next(action);

        _fetchCalendarEntries(
            store, action.isInteractive, action.forcePermission);

        return result;
    }
    }

    return next(action);
});

/**
 * Clears the calendar access status when the app comes back from the
 * background. This is needed as some users may never quit the app, but puts it
 * into the background and we need to try to request for a permission as often
 * as possible, but not annoyingly often.
 *
 * @param {Object} store - The redux store.
 * @param {Object} action - The Redux action.
 * @private
 * @returns {void}
 */
function _maybeClearAccessStatus(store, { appState }) {
    appState === 'background'
        && store.dispatch(setCalendarAuthorization(undefined));
}
