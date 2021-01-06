/**
 * The type of (redux) action which holds login info.
 *
 * {
 *     type: APP_LOGIN
 * }
 */
export const APP_LOGIN = 'APP_LOGIN';

/**
 * The type of (redux) action which signifies if the user is signed in.
 *
 * {
 *     type: SET_USER_SIGNED_OUT
 * }
 */
export const SET_USER_SIGNED_OUT = 'SET_USER_SIGNED_OUT';


export const EXPIRE_TOKEN = 'EXPIRE_TOKEN';

export const SET_POST_WELCOME_SCREEN_DETAILS = 'SET_POST_WELCOME_SCREEN_DETAILS';

/**
 * The type of (redux) action which signifies if the user is signed in using google oauth.
 *
 * {
 *     type: SET_GOOGLE_OFFLINE_CODE
 * }
 */
export const SET_GOOGLE_OFFLINE_CODE = 'SET_GOOGLE_OFFLINE_CODE';
