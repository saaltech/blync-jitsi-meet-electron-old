// @flow

import React from 'react';

import { translate } from '../../../i18n';
import { IconContext } from 'react-icons';
import { FaGoogle } from 'react-icons/fa';


import AbstractGoogleSignInButton from './AbstractGoogleSignInButton';
import { showEnableCookieTip } from '../functions';

/**
 * A React Component showing a button to sign in with Google.
 *
 * @extends Component
 */
class GoogleSignInButton extends AbstractGoogleSignInButton {

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;

        return (
            <>
                <div
                    className='google-sign-in'
                    onClick={this.props.onClick}>
                    <IconContext.Provider value={{
                        style: {
                            color: 'white'
                        }
                    }}>
                        <div className="google-icon">
                            <FaGoogle size={20} />
                        </div>
                    </IconContext.Provider>
                    {/* <img
                        className = 'google-logo'
                        src = 'images/googleLogo.svg' /> */}
                    <div className='google-cta'>
                        {
                            t(this.props.signedIn
                                ? 'liveStreaming.signOut'
                                : 'liveStreaming.signIn')
                        }
                    </div>
                </div>
                {
                    <div id="enableCookieTooltip" className="hide">
                        <div
                            onClick={() => showEnableCookieTip(false)}
                            className='close-icon' />
                        Please enable third-party cookies and reload to use this feature.
                        Click <a
                            onClick={() => showEnableCookieTip(false)}
                            href="https://developers.google.com/identity/sign-in/web/troubleshooting#known_issues" target="_blank">
                            here
                        </a> for more info.
                    </div>
                }

            </>
        );
    }
}

export default translate(GoogleSignInButton);
