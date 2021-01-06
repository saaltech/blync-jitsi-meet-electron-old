/* @flow */

import React, { useState, useEffect } from 'react';

import { Avatar } from '../../base/avatar';
import {
    Icon,
    IconMenuDown,
    IconMenuUp,
    IconLogout
} from '../../base/icons';
import { connect } from 'react-redux';
import { signOut } from '../../google-api';
import googleApi from '../../google-api/googleApi';
import useRequest from '../../hooks/use-request';
import { resolveAppLogout } from '../actions';

/**
 */
function Profile(props) {
    const [ menuExpanded, setMenuExpanded ] = useState(false);

    const { showMenu = false, user = {}, t, disableMenu = true, postLogout } = props;

    const wrapperRef = React.createRef();

    /**
     * Collapse if clicked on outside of element.
     */
    const handleClickOutside = event => {
        if (wrapperRef && wrapperRef.current
            && !wrapperRef.current.contains(event.target)) {
            showMenu && setMenuExpanded(false);
        }
    };

    const logout = () => {
        if (googleApi.isSignedIn()) {
            APP.store.dispatch(signOut());
        }
        APP.store.dispatch(resolveAppLogout());
        postLogout && postLogout();
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    });


    return (
        <div
            className = { 'userProfile' }
            onClick = { () => showMenu && setMenuExpanded(!menuExpanded) }>
            <div className = { 'userName' }>{ user.name }</div>
            <Avatar
                className = 'avatarProfile'
                displayName = { user.name }
                size = { '54' }
                url = { user.avatar } />
            {
                showMenu
            && <div className = 'menuIcon'>
                {/* {
                    !menuExpanded
                        ? <Icon src = { IconMenuDown } />
                        : <Icon src = { IconMenuUp } />
                } */}
                {
                    menuExpanded
                    && <ul
                        className = 'profileMenu'
                        ref = { wrapperRef }>
                        <li onClick = { logout }>
                            <Icon src = { IconLogout } />
                            <div className = 'menuLabel'>
                                { 'Logout' }
                            </div>
                        </li>
                    </ul>
                }
            </div>
            }
        </div>
    );
}

/**
 */
function _mapStateToProps(state: Object) {
    return {
        user: state['features/app-auth'].user || {}
    };
}

export default connect(_mapStateToProps)(Profile);
