import React from 'react';
import { IconContext } from 'react-icons';
import { translate } from '../../../i18n';
import { Icon, IconWarning, IconSadSmiley } from '../icons';

import { RiContactsBookFill, RiVideoChatFill, RiVideoAddFill } from 'react-icons/ri';
import TncPrivacy from '../../welcome/components/TncPrivacy';

function LeftPanel(props) {
    const { interfaceConfig = {}, isNotCreatePermission = false, toolTipClose, showNoCreateMeetingPrivilegeTip = false, activeButton = 'join', setActiveButton } = props;

    function handleClickIcon(value) {
        setActiveButton(value);
    }
    function _renderLogo() {
        let reactElement = null;

        const style = {
            position: 'fixed',
            top: '10px',
            left: '0px',
            backgroundImage: `url(${interfaceConfig?.LOGO_WITH_BOTTOM_LABEL_URL || '../app/images/logo_bottom_label.png'})`
        };

        reactElement = (<div
            className='left-logo'
            style={style} />);

        return reactElement;
    }

    const createButtonColor = isNotCreatePermission ? '#D1D1D1' : activeButton === 'create' ? 'white' : '#005C85'
    const createTextColor = isNotCreatePermission ? '#D1D1D1' : activeButton === 'create' ? '#00C062' : '#005C85'
    function renderButton() {
        let reactElement = null;

        reactElement = (
            <div>
                <IconContext.Provider value={{
                    style: {
                        cursor: 'pointer',
                        color: activeButton === 'contacts' ? 'white' : '#D1D1D1'
                    }
                }}>
                    <div className="left-panel-options">
                        <div className={`icon-wrapper disabled ${activeButton === 'contacts' ? 'selected' : ''}`}
                            onClick={() => {
                                // handleClickIcon('contacts')
                            }}
                            style={{ textAlign: 'center' }}>
                            <RiContactsBookFill size={30} />

                        </div>
                        <div style={{ textAlign: 'center', marginTop: '10px', color: activeButton === 'contacts' ? '#00C062' : '#D1D1D1' }}>
                            Contacts
                        </div>
                    </div>
                </IconContext.Provider>
                <IconContext.Provider value={{
                    style: {
                        cursor: 'pointer',
                        color: activeButton === 'join' ? 'white' : '#005C85'
                    }
                }}>
                    <div className="left-panel-options">
                        <div
                            className={`icon-wrapper ${activeButton === 'join' ? 'selected' : ''}`}
                            onClick={() => { handleClickIcon('join') }}
                            style={{ textAlign: 'center' }}>
                            <RiVideoChatFill size={30} />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '10px', color: activeButton === 'join' ? '#00C062' : '#005C85' }}>
                            Join
                        </div>
                    </div>
                </IconContext.Provider>
                <IconContext.Provider value={{
                    style: {
                        cursor: 'pointer',
                        color: createButtonColor,
                    }
                }}>
                    <div className="left-panel-options">
                        {showNoCreateMeetingPrivilegeTip && (<><div className="active-cap"></div>
                            <div className='tooltip show'>
                                <div
                                    className='close-icon'
                                    onClick={toolTipClose} />
                                <div className='tooltip__icon'> <Icon src={IconSadSmiley} /> </div>
                                <div className='tooltip__message'>{props.t('welcomepage.noCreateMeetingRights')}</div>
                            </div>
                        </>)}
                        <div
                            className={`icon-wrapper ${isNotCreatePermission ? 'disabled' : ''} ${activeButton === 'create' ? 'selected' : ''}`}
                            onClick={() => { handleClickIcon('create') }}
                            style={{ textAlign: 'center' }}>
                            <RiVideoAddFill size={30} />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '10px', color: createTextColor }}>
                            Create
                        </div>
                    </div>
                </IconContext.Provider>

            </div>);

        return reactElement;
    }

    /**
     * Renders a Jifmeet terms and conditions and privacy section.
     *
     * @private
     * @returns {ReactElement|null}
     */
    function _renderPrivacySection() {
        let reactElement = null;

        reactElement = (<TncPrivacy />);

        return reactElement;
    }

    return (
        <div className='left-header'>
            {
                _renderLogo()
            }
            {
                renderButton()
            }
            {
                _renderPrivacySection()
            }
        </div>
    )
}

export default translate(LeftPanel);