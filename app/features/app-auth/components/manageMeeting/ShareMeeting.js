/* @flow */

import React, { useState } from 'react';

import config from '../../../config'
import { translate } from '../../../../i18n';
import { connect } from '../../../redux';
import InviteByEmailSection from '../../../invite/components/add-people-dialog/web/InviteByEmailSection';
import { getInviteText } from '../../../invite/functions';

function ShareMeeting(props) {
    const {
        t,
        isShowLabel = true,
        meetingId: _meetingId,
        _conferenceName,
        _localParticipantName,
        _locationUrl,
        meetingName,
        meetingFrom,
        meetingTo,
        meetingPassword } = props;

    const inviteSubject = t('addPeople.inviteMoreMailSubject', {
        appName: config.appName
    });

    const invite = getInviteText({
        _conferenceName,
        _localParticipantName,
        _inviteUrl: config.defaultServerURL + '/' + _meetingId + '?join=true',
        _locationUrl,
        _dialIn: {},
        _liveStreamViewURL: null,
        _password: meetingPassword,
        _fromDate: meetingFrom,
        _toDate: meetingTo,
        _meetingName: meetingName,
        _meetingId,
        phoneNumber: null,
        t
    });

    return (
        <div className="shareMeetingWrapper" style={{ marginTop: !isShowLabel ? '10px' : '25px' }}>
            <div className={'shareMeeting'}>
                <InviteByEmailSection
                    inviteSubject={inviteSubject}
                    isShowLabel={isShowLabel}
                    inviteText={invite}
                    custom={true} />

            </div>
        </div>
    );
}

const mapStateToProps = state => {

    return {
        _conferenceName: null,
        _dialIn: null,
        _localParticipantName: state['features/app-auth'].user?.name,
        _locationUrl: config.defaultServerURL
    };
};

export default translate(connect(mapStateToProps, {})(ShareMeeting));
