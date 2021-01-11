// @flow

import type { Dispatch } from 'redux';

import {
    getCalendarEntries,
    googleApi,
    loadGoogleAPI,
    signIn,
    updateProfile
} from '../../google-api';

/**
 * A stateless collection of action creators that implements the expected
 * interface for interacting with the Google API in order to get calendar data.
 *
 * @type {Object}
 */
export const googleCalendarApi = {
    /**
     * Retrieves the current calendar events.
     *
     * @param {number} fetchStartDays - The number of days to go back
     * when fetching.
     * @param {number} fetchEndDays - The number of days to fetch.
     * @returns {function(): Promise<CalendarEntries>}
     */
    getCalendarEntries,

    /**
     * Returns the email address for the currently logged in user.
     *
     * @returns {function(Dispatch<any>): Promise<string|never>}
     */
    getCurrentEmail() {
        return updateProfile();
    },

    /**
     * Initializes the google api if needed.
     *
     * @returns {function(Dispatch<any>, Function): Promise<void>}
     */
    load() {
        return (dispatch: Dispatch<any>) => dispatch(loadGoogleAPI());
    },

    /**
     * Prompts the participant to sign in to the Google API Client Library.
     *
     * @returns {function(Dispatch<any>): Promise<string|never>}
     */
    signIn,

    /**
     * Returns whether or not the user is currently signed in.
     *
     * @returns {function(): Promise<boolean>}
     */
    _isSignedIn() {
        return () => googleApi.isSignedIn();
    }
};