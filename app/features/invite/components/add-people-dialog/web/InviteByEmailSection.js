// @flow

import Tooltip from '@atlaskit/tooltip';
import React, { useState, useEffect } from 'react';
import { WhatsappShareButton } from 'react-share';

import { translate } from '../../../../../i18n';
import {
    Icon,
    IconArrowDownSmall,
    IconCopy,
    IconEmail,
    IconGoogle,
    IconOutlook,
    IconYahoo,
    IconWhatsapp
} from '../../../../base/icons';
import { openURLInBrowser } from '../../../../base/util';

import { copyText } from './utils';

type Props = {

    /**
     * The encoded invitation subject.
     */
    inviteSubject: string,

    /**
     * The encoded invitation text to be sent.
     */
    inviteText: string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    custom?: boolean
};

/**
 * Component that renders email invite options.
 *
 * @returns {React$Element<any>}
 */
function InviteByEmailSection({ isShowLabel = true, inviteSubject, inviteText, t, custom = false }: Props) {
    const [isActive, setIsActive] = useState(false);
    const encodedInviteSubject = encodeURIComponent(inviteSubject);
    const encodedInviteText = encodeURIComponent(inviteText);

    useEffect(() => {
        setIsActive(custom);
    });

    /**
     * Copies the conference invitation to the clipboard.
     *
     * @returns {void}
     */
    function _onCopyText() {
        copyText(inviteText);
    }

    /**
     * Returns the conference invitation text.
     *
     * @returns {string}
     */
    function _getInviteText() {
        return inviteText;
    }

    /**
     * Opens an email provider containing the conference invite.
     *
     * @param {string} url - The url to be opened.
     * @returns {Function}
     */
    function _onSelectProvider(url) {
        return function () {
            openURLInBrowser(url, true);
        };
    }

    /**
     * Toggles the email invite drawer.
     *
     * @returns {void}
     */
    function _onToggleActiveState() {
        setIsActive(!isActive);
    }

    function onClickCopy() {
        copyText(inviteText);
    }
    /**
     * Renders clickable elements that each open an email client
     * containing a conference invite.
     *
     * @returns {React$Element<any>}
     */
    function renderEmailIcons() {
        const PROVIDER_MAPPING = [
            {
                icon: IconEmail,
                tooltipKey: 'addPeople.defaultEmail',
                url: `mailto:?subject=${encodedInviteSubject}&body=${encodedInviteText}`
            },
            {
                icon: IconGoogle,
                tooltipKey: 'addPeople.googleEmail',
                url: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedInviteSubject}&body=${encodedInviteText}`
            },
            {
                icon: IconOutlook,
                tooltipKey: 'addPeople.outlookEmail',
                // eslint-disable-next-line max-len
                url: `https://outlook.office.com/mail/deeplink/compose?subject=${encodedInviteSubject}&body=${encodedInviteText}`
            },
            {
                icon: IconYahoo,
                tooltipKey: 'addPeople.yahooEmail',
                url: `https://compose.mail.yahoo.com/?To=&Subj=${encodedInviteSubject}&Body=${encodedInviteText}`
            }
        ];

        return (
            <>
                {
                    PROVIDER_MAPPING.map(({ icon, tooltipKey, url }, idx) => (
                        <Tooltip
                            content={t(tooltipKey)}
                            key={idx}
                            position='top'>
                            <div
                                className='invite-icon'
                                onClick={_onSelectProvider(url)}>
                                <Icon src={icon} size={30} />
                            </div>
                        </Tooltip>
                    ))
                }
            </>
        );

    }

    function renderWhatsappShare(url) {
        return (<Tooltip
            content={isShowLabel ? 'Whatsapp message': ''}
            position='top'>
            <WhatsappShareButton
                round={"true"}
                url={url}>
                <Icon src={IconWhatsapp} size={30} />
            </WhatsappShareButton>
        </Tooltip>);
    }

    function renderCopyIcon(url) {
        return (<Tooltip
            content={isShowLabel ? 'Copy meeting details' : ''}
            position='top'>
            <div className="Copy-Link" onClick={onClickCopy}>
                <Icon src={IconCopy} />
            </div>
        </Tooltip>);
    }

    return (
        <>
            {
                custom
                    ? <div className='share-meeting-details'>
                        {isShowLabel ? <div className='label'>{t('addPeople.shareInvite')}</div> : <></>}
                        <div className='modalities'>
                            {renderCopyIcon()}
                            {renderEmailIcons()}
                            {renderWhatsappShare(_getInviteText())}
                        </div>
                    </div>
                    : <>
                        <div>
                            <div
                                className={`invite-more-dialog email-container${isActive ? ' active' : ''}`}
                                onClick={_onToggleActiveState}>
                                <span>{t('addPeople.shareInvite')}</span>
                                <Icon src={IconArrowDownSmall} />
                            </div>
                            <div className={`invite-more-dialog icon-container${isActive ? ' active' : ''}`}>
                                {renderCopyIcon()}
                                {renderEmailIcons()}
                                {renderWhatsappShare(_getInviteText())}
                            </div>
                        </div>
                        <div className='invite-more-dialog separator' />
                    </>
            }

        </>
    );
}

export default translate(InviteByEmailSection);
