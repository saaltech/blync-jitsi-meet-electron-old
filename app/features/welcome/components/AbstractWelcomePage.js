// @flow

// import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';
import { Component } from 'react';
import type { Dispatch } from 'redux';

import { validateMeetingCode } from '../../app-auth/functions';
import isInsecureRoomName from '../../base/util/isInsecureRoomName';
import { isCalendarEnabled } from '../../calendar-sync';
import { createConferenceObjectFromURL } from '../../utils';
import { push } from 'react-router-redux';
import configs from '../../config';

import { Onboarding, startOnboarding } from '../../onboarding';
import {
    CALENDAR_TYPE,
    signIn
} from '../../calendar-sync';

/**
 * {@code AbstractWelcomePage}'s React {@code Component} prop types.
 */
type Props = {

    /**
     * Whether the calendar functionality is enabled or not.
     */
    _calendarEnabled: boolean,

    /**
     * Whether the insecure room name functionality is enabled or not.
     */
    _enableInsecureRoomNameWarning: boolean,

    /**
     * Room name to join to.
     */
    _room: string,

    /**
     * The current settings.
     */
    _settings: Object,

    /**
     * The Redux dispatch Function.
     */
    dispatch: Dispatch<any>
};

/**
 * Base (abstract) class for container component rendering the welcome page.
 *
 * @abstract
 */
export class AbstractWelcomePage extends Component<Props, *> {
    _mounted: ?boolean;

    /**
     * Implements React's {@link Component#getDerivedStateFromProps()}.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props: Props, state: Object) {
        return {
            room: props._room || state.room
        };
    }

    /**
     * Save room name into component's local state.
     *
     * @type {Object}
     * @property {number|null} animateTimeoutId - Identifier of the letter
     * animation timeout.
     * @property {string} generatedRoomname - Automatically generated room name.
     * @property {string} room - Room name.
     * @property {string} roomPlaceholder - Room placeholder that's used as a
     * placeholder for input.
     * @property {nubmer|null} updateTimeoutId - Identifier of the timeout
     * updating the generated room name.
     */
    state = {
        animateTimeoutId: undefined,
        generatedRoomname: '',
        insecureRoomName: false,
        joining: false,
        room: '',
        roomPlaceholder: '',
        updateTimeoutId: undefined,
        serverURL: undefined
    };

    /**
     * Initializes a new {@code AbstractWelcomePage} instance.
     *
     * @param {Props} props - The React {@code Component} props to initialize
     * the new {@code AbstractWelcomePage} instance with.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._animateRoomnameChanging
            = this._animateRoomnameChanging.bind(this);
        this._onJoin = this._onJoin.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._renderInsecureRoomNameWarning = this._renderInsecureRoomNameWarning.bind(this);
        this._updateRoomname = this._updateRoomname.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after mounting occurs.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.dispatch(startOnboarding('welcome-page'));

        const receiveMessage = (evt) => {
            if(evt.data.syncStoreReq) {
               // Send the 'features/app-auth' data stored in electron window,
               // down to the requesting iframe
               console.log('==> Source window: ', evt.source);
               evt.source.postMessage({ appAuth: JSON.parse(window.localStorage.getItem('features/app-auth')) }, '*');
            }
            else if(evt.data.googleLogin) {
               APP.store.dispatch(signIn(CALENDAR_TYPE.GOOGLE));
            }
            
       }

       window.addEventListener('message', receiveMessage, false);

        this._mounted = true;

         // Check and parse url if exists in location state.
         if (this.props.location.state) {
            const { room, serverURL } = this.props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
            console.log("Server URL: ", serverURL);

            this.setState({
                serverURL
            })
        }
    }

    /**
     * Implements React's {@link Component#componentWillUnmount()}. Invoked
     * immediately before this component is unmounted and destroyed.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._clearTimeouts();
        this._mounted = false;
    }

    _animateRoomnameChanging: (string) => void;

    /**
     * Animates the changing of the room name.
     *
     * @param {string} word - The part of room name that should be added to
     * placeholder.
     * @private
     * @returns {void}
     */
    _animateRoomnameChanging(word: string) {
        let animateTimeoutId;
        const roomPlaceholder = this.state.roomPlaceholder + word.substr(0, 1);

        if (word.length > 1) {
            animateTimeoutId
                = setTimeout(
                    () => {
                        this._animateRoomnameChanging(
                            word.substring(1, word.length));
                    },
                    70);
        }
        this.setState({
            animateTimeoutId,
            roomPlaceholder
        });
    }

    /**
     * Method that clears timeouts for animations and updates of room name.
     *
     * @private
     * @returns {void}
     */
    _clearTimeouts() {
        clearTimeout(this.state.animateTimeoutId);
        clearTimeout(this.state.updateTimeoutId);
    }

    /**
     * Renders the insecure room name warning.
     *
     * @returns {ReactElement}
     */
    _doRenderInsecureRoomNameWarning: () => React$Component<any>;

    /**
     * Renders the insecure room name warning.
     *
     * @returns {ReactElement}
     */
    _doRenderInvalidCode: () => React$Component<any>;

    _onJoin: () => void;

    /**
     * Handles joining. Either by clicking on 'Join' button
     * or by pressing 'Enter' in room name input field.
     *
     * @protected
     * @returns {void}
     */
    _onJoin(action = '') {
        const room = this.state.room || this.state.generatedRoomname;

        // if (room) {
            this.setState({ joining: true });

            // By the time the Promise of appNavigate settles, this component
            // may have already been unmounted.
            const onAppNavigateSettled
                = () => this._mounted && this.setState({ joining: false });
            const meetingDetails = APP.store.getState()['features/app-auth'].meetingDetails;
            //this.props.dispatch(appNavigate(meetingDetails.meetingId + "?home=true&jwt="+APP.store.getState()['features/app-auth'].meetingAccessToken))
            //this.props.dispatch(appNavigate(meetingDetails.meetingId + (meetingDetails.isMeetingCode ? `?actions=${action}` : `?home=true&actions=${action}`)))
            //    .then(onAppNavigateSettled, onAppNavigateSettled);

            
            
            
            const conference = createConferenceObjectFromURL(
                configs.defaultServerURL + '/' + meetingDetails.meetingId + (meetingDetails.isMeetingCode ? `?actions=${action}` : `?home=true&actions=${action}`));

            if (!conference) {
                return;
            }

            console.log("this.props.dispatch: ", this.props.dispatch);
            this.props.dispatch(push('/conference', conference));
    }

    _onRoomChange: (string) => void;

    /**
     * Handles 'change' event for the room name text input field.
     *
     * @param {string} value - The text typed into the respective text input
     * field.
     * @protected
     * @returns {void}
     */
    _onRoomChange(value: string) {
        this.setState({
            room: value,
            insecureRoomName: this.props._enableInsecureRoomNameWarning && value && isInsecureRoomName(value)
        });
    }

    _renderInsecureRoomNameWarning: () => React$Component<any>;;

    /**
     * Renders the insecure room name warning if needed.
     *
     * @returns {ReactElement}
     */
    _renderInsecureRoomNameWarning(code = false) {
        if (this.props._enableInsecureRoomNameWarning && this.state.insecureRoomName) {
            return this._doRenderInsecureRoomNameWarning();
        }

        // check Meeting ID format
        if (code && !validateMeetingCode(this.state.room)) {
            return this._doRenderInvalidCode();
        }

        return null;
    }

    _updateRoomname: () => void;

    /**
     * Triggers the generation of a new room name and initiates an animation of
     * its changing.
     *
     * @protected
     * @returns {void}
     */
    _updateRoomname() {
        const generatedRoomname = ''; // generateRoomWithoutSeparator();
        const roomPlaceholder = '';
        const updateTimeoutId = setTimeout(this._updateRoomname, 10000);

        this._clearTimeouts();
        this.setState(
            {
                generatedRoomname,
                roomPlaceholder,
                updateTimeoutId
            },
            () => this._animateRoomnameChanging(generatedRoomname));
    }
}

/**
 * Maps (parts of) the redux state to the React {@code Component} props of
 * {@code AbstractWelcomePage}.
 *
 * @param {Object} state - The redux state.
 * @protected
 * @returns {{
 *     _calendarEnabled: boolean,
 *     _room: string,
 *     _settings: Object
 * }}
 */
export function _mapStateToProps(state: Object) {
    return {
        _calendarEnabled: isCalendarEnabled(state),
        _enableInsecureRoomNameWarning: false,
        //_room: state['features/base/conference'].room,
        _settings: state['features/base/settings'],
        _isUserSignedOut: !state['features/app-auth'].user || state['features/app-auth'].isUserSignedOut,
        _meetingDetails: state['features/app-auth'].meetingDetails,
        _user: state['features/app-auth'].user,
        _isGoogleSigninUser: Boolean(state['features/app-auth'].googleOfflineCode)
    };
}
