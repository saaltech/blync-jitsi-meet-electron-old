// @flow

import { toState } from '../redux';
import axios from 'axios';
import configs from '../config';

declare var APP: Object;

/**
 * Determines whether the {@code WelcomePage} is enabled by the app itself
 * (e.g. Programmatically via the Jitsi Meet SDK for Android and iOS). Not to be
 * confused with {@link isWelcomePageUserEnabled}.
 *
 * @param {Function|Object} stateful - The redux state or {@link getState}
 * function.
 * @returns {boolean} If the {@code WelcomePage} is enabled by the app, then
 * {@code true}; otherwise, {@code false}.
 */
export function isWelcomePageAppEnabled(stateful: Function | Object) {
    return true;
}

/**
 * Determines whether the {@code WelcomePage} is enabled by the user either
 * herself or through her deployment config(uration). Not to be confused with
 * {@link isWelcomePageAppEnabled}.
 *
 * @param {Function|Object} stateful - The redux state or {@link getState}
 * function.
 * @returns {boolean} If the {@code WelcomePage} is enabled by the user, then
 * {@code true}; otherwise, {@code false}.
 */
export function isWelcomePageUserEnabled(stateful: Function | Object) {
    return (
        typeof APP === 'undefined'
            ? true
            : toState(stateful)['features/base/config'].enableWelcomePage);
}

/**
 */
export function redirectOnInvalidMeeting(meetingId) {
    // notify external apps
    APP.API.notifyReadyToClose();
    
    window.location.href = `${window.location.origin}?invalidMeetingId=${meetingId}`;
}

export function redirectOnButtonChange(buttonType) {
    window.location.href = `${window.location.origin}?actions=${buttonType}`;
}

/**
 * Check if the meeting exists, given the meeting Id
 */
export async function getMeetingById(meetingId) {
    try {
        const config = configs.config;
        console.log("config: ", config)
        const res = await axios.get(`${configs.defaultServerURL + config.conferenceManager + config.unauthConferenceEP}/${meetingId}`);

        if (res) {
            return true;
        }
    } catch (e) {
        return false;
    }

    return false;
}


