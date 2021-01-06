// @flow

import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';
import type { Dispatch } from 'redux';

import { loadGoogleAPI } from '../google-api';
import { showEnableCookieTip } from '../google-api/functions'
import { ERRORS } from './constants';

import {
    CLEAR_CALENDAR_INTEGRATION,
    SET_CALENDAR_AUTH_STATE,
    SET_CALENDAR_ERROR,
    SET_CALENDAR_INTEGRATION,
    SET_CALENDAR_PROFILE_EMAIL,
    SET_LOADING_CALENDAR_EVENTS
} from './actionTypes';
import { _getCalendarIntegration, isCalendarEnabled } from './functions';
import logger from './logger';


/**
 * Sets the initial state of calendar integration by loading third party APIs
 * and filling out any data that needs to be fetched.
 *
 * @returns {Function}
 */
export function bootstrapCalendarIntegration(): Function {
    return (dispatch, getState) => {
        const state = getState();

        if (!isCalendarEnabled(state)) {
            return Promise.reject();
        }

        const {
            googleApiApplicationClientID
        } = state['features/base/config'];
        
        let {
            integrationReady,
            integrationType
        } = state['features/calendar-sync'];

        return Promise.resolve()
            .then(() => {
                if (googleApiApplicationClientID) {
                    return dispatch(loadGoogleAPI());
                }
            })
            .then(() => {
                const {
                    googleOfflineCode,
                    isUserSignedOut
                } = state['features/app-auth'];

                if(!integrationType && googleOfflineCode && !isUserSignedOut) {
                    integrationType = 'google'
                }

                if (!integrationType || integrationReady) {
                    return;
                }

                const integrationToLoad
                    = _getCalendarIntegration(integrationType);

                if (!integrationToLoad) {
                    dispatch(clearCalendarIntegration());

                    return;
                }

                return dispatch(integrationToLoad._isSignedIn())
                    .then(signedIn => {
                        if (signedIn) {
                            dispatch(setIntegrationReady(integrationType));
                            dispatch(updateProfile(integrationType));
                            dispatch(refreshCalendar())
                        } else {
                            dispatch(clearCalendarIntegration());
                        }
                    });
            });
    };
}

/**
 * Resets the state of calendar integration so stored events and selected
 * calendar type are cleared.
 *
 * @returns {{
 *     type: CLEAR_CALENDAR_INTEGRATION
 * }}
 */
export function clearCalendarIntegration() {
    return {
        type: CLEAR_CALENDAR_INTEGRATION
    };
}

/**
 * Asks confirmation from the user to add a Jitsi link to the calendar event.
 *
 * NOTE: Currently there is no confirmation prompted on web, so this is just
 * a relaying method to avoid flow problems.
 *
 * @param {string} eventId - The event id.
 * @param {string} calendarId - The calendar id.
 * @returns {Function}
 */
export function openUpdateCalendarEventDialog(
        eventId: string, calendarId: string) {
    return updateCalendarEvent(eventId, calendarId);
}

/**
 * Sends an action to update the current calendar api auth state in redux.
 * This is used only for microsoft implementation to store it auth state.
 *
 * @param {number} newState - The new state.
 * @returns {{
 *     type: SET_CALENDAR_AUTH_STATE,
 *     msAuthState: Object
 * }}
 */
export function setCalendarAPIAuthState(newState: ?Object) {
    return {
        type: SET_CALENDAR_AUTH_STATE,
        msAuthState: newState
    };
}

/**
 * Sends an action to update the calendar error state in redux.
 *
 * @param {Object} error - An object with error details.
 * @returns {{
 *     type: SET_CALENDAR_ERROR,
 *     error: Object
 * }}
 */
export function setCalendarError(error: ?Object) {
    return {
        type: SET_CALENDAR_ERROR,
        error
    };
}

/**
 * Sends an action to update the current calendar profile email state in redux.
 *
 * @param {number} newEmail - The new email.
 * @returns {{
 *     type: SET_CALENDAR_PROFILE_EMAIL,
 *     email: string
 * }}
 */
export function setCalendarProfileEmail(newEmail: ?string) {
    return {
        type: SET_CALENDAR_PROFILE_EMAIL,
        email: newEmail
    };
}

/**
 * Sends an to denote a request in is flight to get calendar events.
 *
 * @param {boolean} isLoadingEvents - Whether or not calendar events are being
 * fetched.
 * @returns {{
 *     type: SET_LOADING_CALENDAR_EVENTS,
 *     isLoadingEvents: boolean
 * }}
 */
export function setLoadingCalendarEvents(isLoadingEvents: boolean) {
    return {
        type: SET_LOADING_CALENDAR_EVENTS,
        isLoadingEvents
    };
}

/**
 * Sets the calendar integration type to be used by web and signals that the
 * integration is ready to be used.
 *
 * @param {string|undefined} integrationType - The calendar type.
 * @returns {{
 *      type: SET_CALENDAR_INTEGRATION,
 *      integrationReady: boolean,
 *      integrationType: string
 * }}
 */
export function setIntegrationReady(integrationType: string) {
    return {
        type: SET_CALENDAR_INTEGRATION,
        integrationReady: true,
        integrationType
    };
}

/**
 * Signals signing in to the specified calendar integration.
 *
 * @param {string} calendarType - The calendar integration which should be
 * signed into.
 * @returns {Function}
 */
export function signIn(calendarType: string): Function {
    return (dispatch: Dispatch<any>) => {
        const integration = _getCalendarIntegration(calendarType);

        if (!integration) {
            return Promise.reject('No supported integration found');
        }

        return dispatch(integration.load())
            .then(() => dispatch(integration.signIn()))
            .then(() => 
                 dispatch(setIntegrationReady(calendarType))
            )
            .then(() => 
                 dispatch(updateProfile(calendarType))
            )
            .then(() => 
                 dispatch(refreshCalendar())
            )
            // .then(() => 
            //     sendAnalytics(createCalendarConnectedEvent())
            // )
            .catch(error => {
                if(error.error === ERRORS.GOOGLE_APP_MISCONFIGURED) {
                    showEnableCookieTip(true);
                }
                logger.error(
                    'Error occurred while signing in using Google oauth',
                    error);

                return Promise.reject(error);
            });
    };
}

/**
 * Updates calendar event by generating new invite URL and editing the event
 * adding some descriptive text and location.
 *
 * @param {string} id - The event id.
 * @param {string} calendarId - The id of the calendar to use.
 * @returns {Function}
 */
export function updateCalendarEvent(id: string, calendarId: string): Function {
    return (dispatch: Dispatch<any>, getState: Function) => {

        const { integrationType } = getState()['features/calendar-sync'];
        const integration = _getCalendarIntegration(integrationType);

        if (!integration) {
            return Promise.reject('No integration found');
        }

        const { locationURL } = getState()['features/base/connection'];
        const newRoomName = generateRoomWithoutSeparator();
        let href = locationURL.href;

        href.endsWith('/') || (href += '/');

        const roomURL = `${href}${newRoomName}`;

        return dispatch(integration.updateCalendarEvent(
                id, calendarId, roomURL))
            .then(() => {
                // make a copy of the array
                const events
                    = getState()['features/calendar-sync'].events.slice(0);

                const eventIx = events.findIndex(
                    e => e.id === id && e.calendarId === calendarId);

                // clone the event we will modify
                const newEvent = Object.assign({}, events[eventIx]);

                newEvent.url = roomURL;
                events[eventIx] = newEvent;

                return dispatch(setCalendarEvents(events));
            });
    };
}

/**
 * Signals to get current profile data linked to the current calendar
 * integration that is in use.
 *
 * @param {string} calendarType - The calendar integration to which the profile
 * should be updated.
 * @returns {Function}
 */
export function updateProfile(calendarType: string): Function {
    return (dispatch: Dispatch<any>) => {
        const integration = _getCalendarIntegration(calendarType);

        if (!integration) {
            return Promise.reject('No integration found');
        }

        return dispatch(integration.getCurrentEmail())
            .then(email => {
                dispatch(setCalendarProfileEmail(email));
            })
            .catch((e) => {
                console.log(e)
            });
    };
}


import {
    REFRESH_CALENDAR,
    SET_CALENDAR_AUTHORIZATION,
    SET_CALENDAR_EVENTS
} from './actionTypes';

/**
 * Sends an action to refresh the entry list (fetches new data).
 *
 * @param {boolean} forcePermission - Whether to force to re-ask for
 * the permission or not.
 * @param {boolean} isInteractive - If true this refresh was caused by
 * direct user interaction, false otherwise.
 * @returns {{
 *     type: REFRESH_CALENDAR,
 *     forcePermission: boolean,
 *     isInteractive: boolean
 * }}
 */
export function refreshCalendar(
        forcePermission: boolean = false, isInteractive: boolean = true) {
    return {
        type: REFRESH_CALENDAR,
        forcePermission,
        isInteractive
    };
}

/**
 * Sends an action to signal that a calendar access has been requested. For more
 * info, see {@link SET_CALENDAR_AUTHORIZATION}.
 *
 * @param {string | undefined} authorization - The result of the last calendar
 * authorization request.
 * @returns {{
 *     type: SET_CALENDAR_AUTHORIZATION,
 *     authorization: ?string
 * }}
 */
export function setCalendarAuthorization(authorization: ?string) {
    return {
        type: SET_CALENDAR_AUTHORIZATION,
        authorization
    };
}

/**
 * Sends an action to update the current calendar list in redux.
 *
 * @param {Array<Object>} events - The new list.
 * @returns {{
 *     type: SET_CALENDAR_EVENTS,
 *     events: Array<Object>
 * }}
 */
export function setCalendarEvents(events: Array<Object>) {
    return {
        type: SET_CALENDAR_EVENTS,
        events
    };
}