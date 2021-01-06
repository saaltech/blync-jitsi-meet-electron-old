/* @flow */

import { assign } from '../redux';

import {
    APP_LOGIN,
    SET_USER_SIGNED_OUT,
    EXPIRE_TOKEN,
    SET_POST_WELCOME_SCREEN_DETAILS,
    SET_GOOGLE_OFFLINE_CODE
} from './actionTypes';

import { PersistenceRegistry, ReducerRegistry } from '../redux';

/**
 * The redux subtree of this feature.
 */
const STORE_NAME = 'features/app-auth';

/**
 * Sets up the persistence of the feature {@code recent-list}.
 */
console.log("PersistenceRegistry: ", PersistenceRegistry)
PersistenceRegistry.register(STORE_NAME);

ReducerRegistry.register(STORE_NAME, (state =  {}, action) => {
    switch (action.type) {
        case APP_LOGIN: {
            return assign(state, {
                meetingAccessToken: action.payload.meeting_access_token,
                accessToken: action.payload.access_token,
                expires: action.payload.expires,
                refreshToken: action.payload.refresh_token,
                error: action.error,
                user: action.payload.user
            });
        }

        case SET_USER_SIGNED_OUT: {
            return assign(state, {
                isUserSignedOut: action.payload
            })
        }

        case EXPIRE_TOKEN: {
            return assign(state, {
                expires: 0,
                isUserSignedOut: true,
                refreshToken: null,
                meetingAccessToken: null,
                accessToken: null,
                user: null
            })
        }

        case SET_POST_WELCOME_SCREEN_DETAILS: {
            return assign(state, {
                meetingDetails: action.meetingDetails 
            }) //postWelcomePageScreen
        }

        case SET_GOOGLE_OFFLINE_CODE: {
            return assign(state, {
                googleOfflineCode: action.googleOfflineCode
            })
        }
    }
    return state;
});

