/* @flow */

import React, { useState, useEffect } from 'react';

import configs from '../../config';
import { connect } from 'react-redux';
import {
    CALENDAR_TYPE,
    signIn
} from '../../calendar-sync';
import { InputField } from '../../base/premeeting';
import { GoogleSignInButton, signOut } from '../../google-api';
import { showEnableCookieTip } from '../../google-api/functions';
import useRequest from '../../hooks/use-request';
import { resolveAppLogin } from '../actions';

// import OAuth2Provider from 'electron-oauth-helper/dist/oauth2';

/*const browserWindowParams = {
    'use-content-size': true,
    center: true,
    show: false,
    resizable: false,
    'always-on-top': true,
    'standard-window': true,
    'auto-hide-menu-bar': true,
    'node-integration': false
};

const googleOauth = electronGoogleOauth(browserWindowParams);*/



/**
 */
function LoginComponent(props) {
    /*const CLIENTID='143401360954-91aq4dbaj70tj4q6demjgsj5odk1bppt.apps.googleusercontent.com';
const CLIENTSECRET='47oKX0RCR4Xuq8Za9vjA91tW';

console.log("window: ", window);

const oauthConfig = { 
    access_token_url: "https://dev-jifmeet.saal.ai",
    client_id: CLIENTID,
  //client_secret: CLIENTSECRET,
  redirect_uri: "https://dev-jifmeet.saal.ai",
  authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
  response_type: "code",
  scope: "https://www.googleapis.com/auth/userinfo.profile",
}
//console.log(OAuth2Provider)
const provider = new OAuth2Provider(oauthConfig);*/

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSocialLogin, setIsSocialLogin] = useState(false);
    const [formDisabled, setFormDisabled] = useState(true);
    const { errorMsg, noSignInIcon = false, googleOfflineCode, reasonForLogin = '',
        closeAction, isOverlay = false, hideLogin = false, t, onSocialLoginFailed } = props;

    const config = configs.config;
    
    useEffect(() => {
        /**
         */
        async function socialLogin() {
            const response = await doSocialSignIn(false);

            if (!response) {
                console.log('socialLogin Failed');
                APP.store.dispatch(signOut());
                // Need to do this as the login overlay would be closed here
                isOverlay && onSocialLoginFailed && onSocialLoginFailed();
            }
        }

        if (isSocialLogin && googleOfflineCode) {
            socialLogin();
            setIsSocialLogin(false);
        }
    }, [props.googleOfflineCode]);

    useEffect(() => {
        if (email !== '' && password !== '') {
            setFormDisabled(false);
        } else {
            setFormDisabled(true);
        }
    });

    const [doRequest, errors] = useRequest({
        url: config.unauthenticatedIRP + config.signInEP,
        method: 'post',
        body: {
            username: email,
            password
        },
        onSuccess: data => onSuccess(data)
    });

    const [doSocialSignIn, errorsSocialSignIn] = useRequest({
        url: config.unauthenticatedIRP + config.socialSignInEP,
        method: 'post',
        body: {
            code: googleOfflineCode,
            provider: 'google'
        },
        onSuccess: data => onSuccess(data)
    });

    const onSubmit = async event => {
        event.preventDefault();

        if (formDisabled) {
            return;
        }
        showEnableCookieTip(false);

        // Sign-in
        await doRequest(false);
    };

    const onSuccess = data => {
        // implement appLogin
        APP.store.dispatch(resolveAppLogin(data));
        closeAction();
    };

    /**
     * Clear login form.
     */
    const clearForm = () => {
        setEmail('');
        setPassword('');
    };

    /**
     * Starts the sign in flow for Google calendar integration.
     *
     * @private
     * @returns {void}
     */
    const _onClickGoogle = async () => {
        // Clear any existing errors shown
        if (isOverlay && window.showEnableCookieTip) {
            showEnableCookieTip(true);

            return;
        }
        clearForm();
        isOverlay && closeAction();
        setIsSocialLogin(true);


        const { shell } = window.jitsiNodeAPI.remote

        shell.openExternal("https://localhost:8080/googleAuth")

        /*const BrowserWindow = window.jitsiNodeAPI.remote.BrowserWindow;
        const authWindow = new BrowserWindow({
            width: 600,
            height: 800,
            webPreferences: {
              nodeIntegration: false, // We recommend disabling nodeIntegration for security.
              contextIsolation: true // We recommend enabling contextIsolation for security.
              // see https://github.com/electron/electron/blob/master/docs/tutorial/security.md
            },
          })

        provider.perform(authWindow)
        .then(resp => {
            console.log("then Block",resp)
        })
        .catch(error => console.error("Catch Block",error))*/

        /*const isElectron = navigator.userAgent.includes('Electron');
        if(isElectron) {
            // Send the 'googleLogin' request to the parent containing window (like electron app),
            window.parent.postMessage({'googleLogin': true}, '*');
        } else {
            APP.store.dispatch(signIn(CALENDAR_TYPE.GOOGLE));
        }*/
        
    };

    const loginErrorMsg = (errors && errors.indexOf('server_error') > -1)
        || (errorsSocialSignIn && errorsSocialSignIn.indexOf('server_error') > -1)
        ? 'Login failed. Please try again sometime later.'
        : errors || errorsSocialSignIn || errorMsg;

    return (
        <div
            className={`appLoginComponent ${isOverlay ? 'overlay' : ''}`}
            style={{
                visibility: hideLogin ? 'hidden' : 'visible'
            }}>
            {
                isOverlay && <div
                    className='modal-overlay'
                    id='modal-overlay' />
            }
            <div className={`${isOverlay ? 'modal' : 'inlineComponent'}`}>
                {
                    isOverlay && <div
                        className='close-icon'
                        onClick={closeAction} />
                }
                <div className={`${isOverlay ? 'content' : 'inline-content'}`}>
                    {
                        reasonForLogin && <div className='reasonForLogin'>{reasonForLogin}</div>
                    }
                    {
                        window.config?.googleApiApplicationClientID
                        && window.config?.enableCalendarIntegration
                        && <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ marginRight: '10px' }}>Login with</span>
                            <GoogleSignInButton
                                onClick={_onClickGoogle}
                                text={'Google'} />
                        </div>
                    }
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="divider-line"></div>
                        <div className='option-text-or'>OR</div>
                        <div className="divider-line"></div>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className='form-field'>
                            <div className='form-label'>{'Username'}</div>
                            <InputField
                                focused={true}
                                onChange={value => setEmail(value.trim())}
                                placeHolder={'Enter your username'}
                                value={email} />
                        </div>
                        <div className='form-field'>
                            <div className='form-label'>{'Password'}</div>
                            <InputField
                                onChange={value => setPassword(value.trim())}
                                placeHolder={'Enter your password'}
                                type='password'
                                value={password} />
                        </div>

                        <div
                            className={`login-page-button ${formDisabled ? 'disabled' : ''}`}
                            onClick={onSubmit}>
                            {
                                'Login'
                            }
                        </div>

                        <button
                            style={{
                                height: '0px',
                                width: '0px',
                                visibility: 'hidden'
                            }}
                            type='submit' />
                    </form>


                    <div className='error'> {loginErrorMsg} </div>
                </div>
            </div>
        </div>
    );
}

/**
 */
function _mapStateToProps(state: Object) {
    return {
        googleOfflineCode: state['features/app-auth'].googleOfflineCode
    };
}

export default connect(_mapStateToProps)(LoginComponent);
