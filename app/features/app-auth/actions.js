// @flow

import type { Dispatch } from 'redux';
import axios from 'axios';
import config from '../config'

import {
    SET_USER_SIGNED_OUT,
    APP_LOGIN,
    EXPIRE_TOKEN,
    SET_POST_WELCOME_SCREEN_DETAILS,
    SET_GOOGLE_OFFLINE_CODE
} from './actionTypes';
import { LoginComponent } from './components';
import logger from './logger';

import { isTokenExpired, setToken, validateToken } from './functions'

import {
    getRandomArbitrary
} from './functions'

/**
 * Set Login tokens or error if any and called only when login in
 *
 * @returns {{
 *     type: APP_LOGIN
 * }}
 */
export function resolveAppLogin(details, refreshCall = false) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        if(details.expires_in > 0) {
            details.expires = (new Date()).getTime() + (details.expires_in * 1000)
        }

        if(refreshCall) {
            details['user'] = Object.assign({}, APP.store.getState()['features/app-auth'].user, 
                                    details.user || {});
        }

        dispatch({ type: APP_LOGIN, payload: details });
        dispatch(decideAppLogin())
    };
}

export function invalidateAndGoHome(skipRelogin = false) {
    APP.store.dispatch(resolveAppLogout());
    if(!skipRelogin) {
        window.location.href = window.location.origin + "?sessionExpired=true";
    }
}

export function goHome() {
    // notify external apps
    APP.API.notifyReadyToClose();
    
    window.location.href = window.location.origin
  }

export function resolveAppLogout() {
    return (dispatch: Dispatch<any>, getState: Function) => {

        dispatch({ type: EXPIRE_TOKEN });
    };
}

/**
 * Opens {@link LoginComponent} which will ask to enter username and password
 * for the current conference.
 *
 * @protected
 * @returns {Action}
 */
export function decideAppLogin() {
    // TODO: in future we could have verify token functionality here by making an IRP call
    // For now, just verify the meeting_access_token expiry
    return (dispatch: Dispatch<any>, getState: Function) => {
        dispatch({ type: SET_USER_SIGNED_OUT, payload: !isTokenExpired() });
    }
}

export function setPostWelcomePageScreen(room: string, meetingObj, isCode = false) {

    if(!meetingObj) {
        meetingObj = {
            meetingName: room,
            meetingId: isCode ? room : getRandomArbitrary(10,99) + "-" + (new Date()).getTime() + "-" +
                getRandomArbitrary(100,999),
            isMeetingCode: isCode
        }
    }
    
    return {
        type: SET_POST_WELCOME_SCREEN_DETAILS,
        meetingDetails : meetingObj
    };
}


export async function validationFromNonComponents(tokenRequired, isHomePage = false) {
    let validToken = !tokenRequired || validateToken();

      //TODO check for !validToken once testing is done
      if(!validToken) {
        // Try refreshToken call
        let appAuth = APP.store.getState()['features/app-auth']
        let refreshToken = appAuth && appAuth.refreshToken

        if(refreshToken) {
          try {
            const res = await axios.post(
              config.unauthenticatedIRP + config.refreshToken, 
              {
                refresh_token: refreshToken
              })
              APP.store.dispatch(resolveAppLogin(res.data, true))
              return true;
          }
          catch(e) {
            console.log("refresh Token error", e)
            if(e && e.response && e.response.status == 401) {
              // only in case of invalid grant
              !isHomePage && invalidateAndGoHome(true);
            }
            return false;
          }
        }
        else {
            return false
        }
      }

      return true
}

export async function saveHostJidToUserMapping(connection) {

    if(connection.xmpp && connection.xmpp.connection &&
        connection.xmpp.connection._stropheConn.jid &&
        await validationFromNonComponents(true)) {
        try {
            await axios.post(
                config.conferenceManager + config.jidEP, 
                { 
                    jid: connection.xmpp.connection._stropheConn.jid
                }, 
                setToken(true, true));
        } catch (err) {
            console.log("Unable to save Jid to Host mapping",err)
        }
    }
}

export function setGoogleOfflineCode(googleOfflineCode = null) {
    return {
        type: SET_GOOGLE_OFFLINE_CODE,
        googleOfflineCode
    }
}
