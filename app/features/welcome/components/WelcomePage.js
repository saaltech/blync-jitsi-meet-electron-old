/* global interfaceConfig */

import React from 'react';


import { IconContext } from 'react-icons';
import { RiVideoChatFill } from 'react-icons/ri';

import { BiLoaderCircle } from 'react-icons/bi';
import { LoginComponent, decideAppLogin, Profile, CalendarProfile, ManageMeetings, validationFromNonComponents } from '../../app-auth';
import { validateMeetingCode } from '../../app-auth/functions';
import { setPostWelcomePageScreen } from '../../app-auth/actions';
import { redirectOnButtonChange } from '../functions';
import { translate } from '../../../i18n';
import Icon, { IconWarning, IconSadSmiley } from '../../base/icons';
import LeftPanel from '../../base/leftPanel';
import { connect } from '../../redux';

import { bootstrapCalendarIntegration, ERRORS } from '../../calendar-sync';
import {
    getQueryVariable
} from '../../utils/functions';
import logger from '../logger';
import { getMeetingById } from '../functions';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';
import ButtonWithIcon from '../../base/button-with-icon';

/**
 * The pattern used to validate room name.
 * @type {string}
 */
export const ROOM_NAME_VALIDATE_PATTERN_STR = '^[^?&:\u0022\u0027%#]+$';

/**
 * The Web container rendering the welcome page.
 *
 * @extends AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {
    /**
     * Default values for {@code WelcomePage} component's properties.
     *
     * @static
     */
    static defaultProps = {
        _room: ''
    };

    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,

            selectedTab: 0,
            formDisabled: true,
            hideLogin: true,
            sessionExpiredQuery: false,
            loginErrorMsg: '',
            reasonForLogin: '',
            activeButton: 'join',
            showNoCreateMeetingPrivilegeTip: false,
            switchActiveIndex: this._canCreateMeetings() ? 0 : 1,
            showGoLoader: false
        };

        this._roomInputRef = null;

        // Bind event handlers so they are only bound once per instance.
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this.handleClickMeetNow = this.handleClickMeetNow.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._onRoomNameChanged = this._onRoomNameChanged.bind(this);
        this._setRoomInputRef = this._setRoomInputRef.bind(this);
        this._closeLogin = this._closeLogin.bind(this);
        this._onSocialLoginFailed = this._onSocialLoginFailed.bind(this);
        this._cleanupTooltip = this._cleanupTooltip.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    async componentDidMount() {

        super.componentDidMount();

        window.showEnableCookieTip = false;

        const refreshTokenResponse = await validationFromNonComponents(true, true);

        refreshTokenResponse
            && this.props.dispatch(bootstrapCalendarIntegration())
                .catch(err => {
                    if (err.error === ERRORS.GOOGLE_APP_MISCONFIGURED) {
                        window.showEnableCookieTip = true;
                    }
                    logger.error('Google oauth bootstrapping failed', err)
                });

        this.props.dispatch(setPostWelcomePageScreen(null, {}));
        const invalidMeetingId = getQueryVariable('invalidMeetingId');
        const activeButtonAction = getQueryVariable('actions');

        if (invalidMeetingId) {
            this.setInvalidMeetingId(invalidMeetingId);
        } else if (getQueryVariable('sessionExpired')) {
            this.setState({
                hideLogin: false,
                sessionExpiredQuery: true
            });
        }

        if (activeButtonAction) {
            this.setState({ activeButton: activeButtonAction, showNoCreateMeetingPrivilegeTip: !this._canCreateMeetings() });
            this.setSwitchActiveIndex(activeButtonAction === 'create' ? 0 : 1);
        } else {
            this.setSwitchActiveIndex(1);
            this.setState({ activeButton: 'join', showNoCreateMeetingPrivilegeTip: !this._canCreateMeetings() });
        }
        this.props.dispatch(decideAppLogin());


        document.body.classList.add('welcome-page');

        if (this.state.generateRoomnames) {
            this._updateRoomname();
        }

    }

    /**
     */
    setInvalidMeetingId(invalidMeetingId) {
        this.setValueInRoomInputBox(invalidMeetingId);
        this.setSwitchActiveIndex(1);
    }

    /**
     */
    setValueInRoomInputBox(value) {
        this._roomInputRef.value = value;
    }

    /**
     * Removes the classname used for custom styling of the welcome page.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        document.body.classList.remove('welcome-page');
    }

    /**
     * Room name edit 
     */
    _onRoomNameChanged(e) {
        this._onRoomChange(e);
        if (e.target.value.trim() !== '') {
            this._decideFormDisability(e.target.value.trim());
        } else {
            this.setState({
                formDisabled: true
            });
        }
    }

    /**
     * Set Switch Active index.
     *
     * @param {string} index - Index of toggle switch active index.
     * @private
     * @returns {void}
     */
    setSwitchActiveIndex(index = null) {

        this.setState({
            switchActiveIndex: index === null ? (this._canCreateMeetings() ? 0 : 1) : parseInt(index, 10)
        }, () => {
            // this._decideFormDisability();
            // if (this.state.switchActiveIndex === 1) {
            //     this.handleRouteChange('join');
            // }
        });
    }

    /**
     *
     */
    _decideFormDisability(name = this.state.room) {
        let disabled = false;

        if (!name) {
            disabled = true;
        } else if (this.state.switchActiveIndex) {
            const match = validateMeetingCode(name);

            disabled = !match;
        }

        this.setState({
            formDisabled: disabled
        });
    }

    /**
     *
     */
    _cleanupTooltip() {
        setTimeout(() => {
            if (this._canCreateMeetings()) {
                this.setState({
                    showNoCreateMeetingPrivilegeTip: false
                });
            }
        }, 300);
    }

    /**
     *
     */
    _closeLogin() {
        this.setState({
            hideLogin: true,
            loginErrorMsg: ''
        });
        if (this.state.switchActiveIndex === 0) {
            this.setSwitchActiveIndex();
            if (!this._canCreateMeetings()) {
                this.handleRouteChange('join');
                // this.setState({
                //     showNoCreateMeetingPrivilegeTip: true
                // });
            }
        } else {
            this.setState({ showNoCreateMeetingPrivilegeTip: !this._canCreateMeetings() })
        }
    }

    /**
     */
    _onSocialLoginFailed() {
        this.setState({
            hideLogin: false,
            loginErrorMsg: 'Login failed. Please try again sometime later.'
        });
    }

    _canCreateMeetings() {
        const { _user } = this.props;

        return !_user || (_user.isPartOfTheCircle && _user.role == 'manager');
    }

    handleRedirection(action) {
        if (this.props._isUserSignedOut
            && this.state.activeButton === 'create') {
            this.setState({
                hideLogin: false,
                reasonForLogin: this.props.t('welcomepage.signinToCreateMeeting')
            });

            return;
        }
        this.setState({
            showGoLoader: true,
            formDisabled: true
        });

        this.props.dispatch(setPostWelcomePageScreen(this.state.room, null,
            this.state.switchActiveIndex === 1));


        const intervalId = setInterval(async () => {
            // Done to fix the Redux persist store rehydration issue seen on Safari v13.x
            // rehydration doesnt complete before we navigate to the prejoin page in _onJoin method below.
            const roomId = this.state.room;
            if (roomId) {
                clearInterval(intervalId);

                // Check if the meeting exists
                const meetingExists = await getMeetingById(roomId);
                if (!meetingExists) {
                    super._onRoomChange('');
                    this.setInvalidMeetingId(`${roomId}`);

                    this.setState({
                        showGoLoader: false,
                        formDisabled: false
                    });

                    return;
                }

                this._onJoin(action);
            }
        }, 30);
    }

    handleClickMeetNow(action) {
        // super._onRoomChange('');
        this.setState({ formDisabled: false }, () => { this.handleRedirection(action) })
    }

    /**
     */
    _renderMainContentSection() {
        const { t, _isUserSignedOut, _isGoogleSigninUser } = this.props;
        const { switchActiveIndex } = this.state;

        return (<>
            <div className={`entry-section__label ${(switchActiveIndex === 1 && (_isUserSignedOut || (!_isGoogleSigninUser))) ? 'join-without-google-label' : ''}`}>
                {(switchActiveIndex === 1 && (_isUserSignedOut || (!_isGoogleSigninUser))) && (
                    <IconContext.Provider value={{
                        style: {
                            color: 'white'
                        }
                    }}>
                        <div className="join-without-google-icon-wrapper">
                            <RiVideoChatFill size={40} />
                        </div>
                    </IconContext.Provider>
                )}
                {
                    this.state.activeButton === 'join' ? t('welcomepage.enterJoinMeetingTitle', { defaultValue: 'Join' }) : t('welcomepage.enterCreateMeetingTitle', { defaultValue: 'Create' })
                }
            </div>
            {/* <div className={`entry-section right-bg`}> */}
            <div className={`entry-section ${(switchActiveIndex === 1 && (_isUserSignedOut || (!_isGoogleSigninUser))) ? 'input-section' : 'right-bg'}`}>
                {this.state.activeButton === 'join' ? (
                    <div className={`${(switchActiveIndex === 1 && (_isUserSignedOut || (!_isGoogleSigninUser))) ? 'input-section-container' : ''}`}>
                        <div className="label-content">
                            {'Meeting ID*'}
                        </div>
                        <div id='enter_room'>

                            <div className='enter-room-input-container'>
                                <form onSubmit={this._onFormSubmit}>
                                    <input
                                        autoFocus={true}
                                        className='enter-room-input'
                                        id='enter_room_field'
                                        maxLength={switchActiveIndex ? '20' : '-1'}
                                        onChange={this._onRoomNameChanged}
                                        // pattern = { ROOM_NAME_VALIDATE_PATTERN_STR }
                                        placeholder={switchActiveIndex ? t('welcomepage.placeholderEnterRoomCode')
                                            : t('welcomepage.placeholderEnterRoomName')} // this.state.roomPlaceholder
                                        ref={this._setRoomInputRef}
                                        title={t('welcomepage.roomNameAllowedChars')}
                                        type='text' />
                                </form>
                            </div>
                            <div
                                className={`welcome-page-button go-button ${this.state.formDisabled ? 'disabled' : ''}`}
                                onClick={this._onFormSubmit}>
                                <div className='chat-piece' />
                                {
                                    t('welcomepage.go')
                                }
                                {
                                    this.state.showGoLoader
                                    && <div className='loader'>
                                        <BiLoaderCircle size={30} />
                                    </div>
                                }

                            </div>
                        </div>
                        {
                            switchActiveIndex === 1 && this._roomInputRef
                            && this._renderInsecureRoomNameWarning(this._roomInputRef.value)
                        }
                    </div>
                ) : (
                        <div className="button-wrapper">
                            <ButtonWithIcon
                                className="meet-now"
                                labelText="MEET NOW"
                                // backGroundColor={"#005C85"}
                                onButtonClick={() => { this.handleClickMeetNow('meetNow') }}
                                source={'meet-now-group.svg'}
                            />
                            <div className="schedule--button">
                                <ButtonWithIcon
                                    className="schedule-button"
                                    labelText="SCHEDULE"
                                    onButtonClick={() => { this.handleClickMeetNow('schedule') }}
                                    // backGroundColor={"#FEA729"}
                                    source={'schedule-image.svg'}
                                />
                            </div>
                        </div>
                    )
                }
            </div>
            <div className={`${(switchActiveIndex === 0 && _isUserSignedOut) ? 'contacts-placeholder' : ''}`} >
                {
                    !_isUserSignedOut && _isGoogleSigninUser && switchActiveIndex === 1 ? <CalendarProfile /> : <> </>
                }
            </div>
            {/* <div className={`${(switchActiveIndex === 0) ? 'contacts-placeholder' : ''}`} > */}
            {
                (switchActiveIndex === 0 && !_isUserSignedOut) ? (<ManageMeetings />
                ) : <></>
            }
        </>);
    }

    handleRouteChange(value) {
        redirectOnButtonChange(value);
    }

    /**
     */
    _renderContentHeaderSection() {
        const { t, _isUserSignedOut } = this.props;
        const { hideLogin, sessionExpiredQuery, loginErrorMsg = '' } = this.state;

        const errorOnLoginPage = loginErrorMsg || (sessionExpiredQuery ? 'Session expired.' : '');

        return (<div>
            {
                _isUserSignedOut
                && <LoginComponent
                    closeAction={this._closeLogin}
                    errorMsg={errorOnLoginPage}
                    hideLogin={hideLogin}
                    isOverlay={true}
                    onSocialLoginFailed={this._onSocialLoginFailed}
                    reasonForLogin={this.state.reasonForLogin}
                    t={t} />
            }
            {
                _isUserSignedOut
                    ? <div
                        className={'welcome-page-button signin'}
                        onClick={() => this.setState({
                            reasonForLogin: '',
                            loginErrorMsg: '',
                            hideLogin: false
                        })}>
                        {
                            t('welcomepage.signinLabel')
                        }
                    </div>
                    : <div
                        className={'welcome-page-button profile'}
                        onClick={() => this.setState({
                            hideLogin: true
                        })}>
                        <Profile
                            postLogout={this._cleanupTooltip}
                            showMenu={true} />
                    </div>
            }
        </div>);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    render() {
        const { t, _isUserSignedOut, _isGoogleSigninUser } = this.props;

        return (
            <div>
                {
                    <div
                        className='welcome without-content'
                        id='welcome_page'>

                        <div className='show-flex'>
                            <LeftPanel
                                showNoCreateMeetingPrivilegeTip={this.state.showNoCreateMeetingPrivilegeTip}
                                activeButton={this.state.activeButton}
                                isNotCreatePermission={!this._canCreateMeetings()}
                                toolTipClose={() => { this.setState({ showNoCreateMeetingPrivilegeTip: false }) }}
                                setActiveButton={this.handleRouteChange}
                            />
                            <div className='right-section'>
                                <div className='content-header'>
                                    {
                                        this._renderContentHeaderSection()
                                    }
                                </div>
                                <div className={`content-area`}>
                                    <div className={`main-content ${(this.state.switchActiveIndex === 1 && (_isUserSignedOut || (!_isGoogleSigninUser))) ? 'not-google-user' : ''}`}>
                                        {
                                            this._renderMainContentSection()
                                        }
                                    </div>
                                    {(this.state.switchActiveIndex === 1 && (_isUserSignedOut || (!_isGoogleSigninUser))) ? (<></>) : (
                                        <div className='right-content' >
                                            <div className='calendar-placeholder' />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                }

                <div className='legal-footer'>
                    <p>Copyright © 2021 · Jifmeet. All rights reserved</p>
                </div>

            </div>
        );
    }

    /**
     * Renders the insecure room name warning.
     *
     * @inheritdoc
     */
    _doRenderInsecureRoomNameWarning() {
        return (
            <div className='insecure-room-name-warning'>
                <Icon src={IconWarning} />
                <span>
                    {this.props.t('security.insecureRoomNameWarning')}
                </span>
            </div>
        );
    }

    /**
     * Renders the insecure room name warning.
     *
     * @inheritdoc
     */
    _doRenderInvalidCode() {
        return (
            <div className='insecure-room-name-warning'>
                <Icon src={IconWarning} />
                <span>
                    {this.props.t('security.insecureRoomCodeWarning')}
                </span>
            </div>
        );
    }

    /**
     * Prevents submission of the form and delegates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event) {
        event.preventDefault();
        event.target && event.target.elements && event.target.elements[0].blur();

        if (this.state.formDisabled) {
            return;
        }

        if (this.props._isUserSignedOut
            && this.state.switchActiveIndex === 0) {
            this.setState({
                hideLogin: false,
                reasonForLogin: this.props.t('welcomepage.signinToCreateMeeting')
            });

            return;
        }
        this.setState({
            reasonForLogin: ''
        });

        if (!this._roomInputRef || this._roomInputRef.reportValidity()) {

            this.setState({
                showGoLoader: true,
                formDisabled: true
            });

            this.props.dispatch(setPostWelcomePageScreen(this.state.room, null,
                this.state.switchActiveIndex === 1));


            const intervalId = setInterval(async () => {
                // Done to fix the Redux persist store rehydration issue seen on Safari v13.x
                // rehydration doesnt complete before we navigate to the prejoin page in _onJoin method below.

                const appAuth = JSON.parse(window.localStorage.getItem('features/app-auth'));

                if ((appAuth.meetingDetails || {}).meetingName) {
                    clearInterval(intervalId);

                    // Check if the meeting exists
                    if (appAuth.meetingDetails.isMeetingCode) {
                        const meetingExists = await getMeetingById(appAuth.meetingDetails.meetingId);
                        if (!meetingExists) {
                            super._onRoomChange('');
                            this.setInvalidMeetingId(`${appAuth.meetingDetails.meetingId}`);

                            this.setState({
                                showGoLoader: false,
                                formDisabled: false
                            });

                            return;
                        }
                    }

                    this._onJoin();
                }
            }, 30);
        }
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onRoomChange(event) {
        super._onRoomChange(event.target.value);
    }

    /**
     * Sets the internal reference to the HTMLInputElement used to hold the
     * welcome page input room element.
     *
     * @param {HTMLInputElement} el - The HTMLElement for the input of the room name on the welcome page.
     * @private
     * @returns {void}
     */
    _setRoomInputRef(el) {
        this._roomInputRef = el;
    }

}

export default translate(connect(_mapStateToProps)(WelcomePage));
