/* @flow */

import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { RiVideoChatFill } from 'react-icons/ri';
import { IconContext } from 'react-icons';
import { FaRegCalendarAlt, FaRegAddressCard, FaLock, FaUnlock, FaShareAlt, FaRegCalendarTimes } from 'react-icons/fa';
import { Menu, Dropdown } from 'antd';
import configs from '../../../config';
import useRequest from '../../../hooks/use-request';

import { IoIosCloseCircle } from 'react-icons/io';
import { HiCheckCircle } from 'react-icons/hi';
import ShareMeeting from './ShareMeeting';

import { translate } from '../../../../i18n';

type Props = {
    t: Object,
    calendarEvents: Object,
    height: any
}
/**
 *
 */
function ManageMeetings(props: Props) {
    const [selectedId, setSelectedId] = useState(null);

    const [menuExpanded, setMenuExpanded] = useState(false);

    // selected calendar event
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);

    const { t, onJoin } = props;

    const config = configs.config;

    const wrapperRef = React.createRef();

    const setData = data => {
        if (data && data.length) {
            setCalendarEvents(data.slice(data.length - 50, data.length).reverse());
        } else {
            setCalendarEvents([]);
        }
    }

    const [getConferences, fetchErrors] = useRequest({
        url: `${config.conferenceManager + config.conferenceEP}`,
        method: 'get',
        onSuccess: data => setData(data)
    });
    /**
     * Collapse if clicked on outside of element.
     */
    const handleClickOutside = event => {
        if (wrapperRef && wrapperRef.current
            && !wrapperRef.current.contains(event.target)) {
            setMenuExpanded(false);
        }
    };

    const handleClickStart = meetingId => {
        onJoin(null, meetingId);
    }

    const getConferencesAsync = async () => {
        await getConferences(true);
    }
    /**
     * Collapse if clicked on outside of element.
     */

    useEffect(() => {
        getConferencesAsync();
    }, [])

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    });

    return (
        <div
            className={'manageMeeting'} >
            <div className='upcoming-meetings'>
                <div>{'Manage Meetings'}</div>
            </div>

            {
                <div
                    className='meeting-list' >
                    {
                        calendarEvents.length === 0
                        && <div
                            className={'calendar__event calendar__event__disabled last no-meetings'}
                            key={-1} >
                            <div>{`No meetings`}</div>
                        </div>
                    }
                    {
                        calendarEvents.map((event, index) =>
                            (<div className="meeting-wrapper" key={event.conferenceId}>
                                <div className="meeting-topic-wrapper">
                                    <div className="topic-name" title={event.conferenceName}>
                                        {`Topic : ${event.conferenceName}`}
                                    </div>
                                    <div className="menu-details" onClick={() => { setMenuExpanded(true); setSelectedId(event.id) }}>
                                        <Dropdown arrow={true} placement={'bottomRight'} overlayClassName="meeting-share-dropdown" overlay={<Menu>
                                            <Menu.Item key="0">
                                                <div style={{ display: 'flex' }}>
                                                    <div>
                                                        <div style={{ fontSize: '14px', color: '#393939' }}>
                                                            Share meeting Details
                                                            </div>
                                                        <div>
                                                            {
                                                                <ShareMeeting isShowLabel={false}
                                                                    meetingId={event.conferenceId}
                                                                    meetingUrl={`${window.location.origin}/${event.conferenceId}`}
                                                                    meetingName={event.conferenceName}
                                                                    meetingFrom={event.scheduledFrom}
                                                                    meetingTo={event.scheduledTo}
                                                                    meetingPassword={event.isSecretEnabled ? event.conferenceSecret : ''} />
                                                                
                                                            }
                                                            
                                                        </div>
                                                    </div>
                                                </div>
                                            </Menu.Item>
                                        </Menu>}>
                                            <a>
                                                <IconContext.Provider value={{
                                                    style: {
                                                        color: '#005C85'
                                                    }
                                                }}>
                                                    <FaShareAlt size={20} />

                                                </IconContext.Provider>
                                            </a>
                                        </Dropdown>
                                        <div className='menuIcon'>
                                            {
                                                menuExpanded && selectedId === event.id
                                                // && <Dropdown overlay={menu} trigger={['click']}>

                                                // </Dropdown>
                                                // && <ul
                                                //     className='profileMenu'
                                                //     ref={wrapperRef}>
                                                //     <li>
                                                //         <div><IconContext.Provider value={{
                                                //             style: {
                                                //                 color: '#005C85'
                                                //             }
                                                //         }}>
                                                //             <FaShareAlt size={15} />

                                                //         </IconContext.Provider>
                                                //         </div>
                                                //         <div>
                                                //             <div>Share meeting Details
                                                //             </div>
                                                //             <div>
                                                //                 sharing icons
                                                //             </div>
                                                //         </div>
                                                //         {/* <Icon src={IconLogout} /> */}
                                                //     </li>
                                                //     <li onClick={() => { }}>
                                                //         <div>icon</div>
                                                //         <div>
                                                //             edit
                                                //             </div>
                                                //         {/* <Icon src={IconLogout} /> */}
                                                //     </li>
                                                //     <li onClick={() => { }}>
                                                //         <div>icon</div>
                                                //         <div>
                                                //             delete
                                                //             </div>
                                                //         {/* <Icon src={IconLogout} /> */}
                                                //     </li>
                                                // </ul>
                                            }
                                        </div>

                                    </div>
                                </div>
                                <div className="meeting-details-wrapper">
                                    <div className="meeting-detail-first-row">
                                        <div className="meeting-url">
                                            <div className="meeting-url-icon">
                                                <IconContext.Provider value={{
                                                    style: {
                                                        color: '#00C062'
                                                    }
                                                }}>

                                                    <RiVideoChatFill size={16} />
                                                </IconContext.Provider>
                                            </div>
                                            <div className="meeting-url-link" title={`${window.location.origin}/${event.conferenceId}`}>{`${window.location.origin}/${event.conferenceId}`}</div>
                                        </div>
                                        <div className="meeting-date">
                                            <div className="meeting-calendar-icon">
                                                {event.scheduledFrom && event.scheduledTo ? (
                                                    <IconContext.Provider value={{
                                                        style: {
                                                            color: '#00C062'
                                                        }
                                                    }}>

                                                        <FaRegCalendarAlt size={16} />
                                                    </IconContext.Provider>
                                                ) : (
                                                        <IconContext.Provider value={{
                                                            style: {
                                                                color: '#D1D1D1'
                                                            }
                                                        }}>

                                                            <FaRegCalendarTimes size={16} />
                                                        </IconContext.Provider>
                                                    )}
                                            </div>
                                            {event.scheduledFrom && event.scheduledTo ? (
                                                <div className="meeting-calendar-date" title={`${
                                                    moment(event.scheduledFrom).locale('en').format('DD MMM, hh:mm a')
                                                    }${
                                                    event.scheduledTo && (
                                                        ` - ${moment(event.scheduledTo).isSame(event.scheduledFrom, 'day') ?
                                                            moment(event.scheduledTo).locale('en').format('hh:mm a') :
                                                            moment(event.scheduledTo).locale('en').format('DD MMM, hh:mm a')}`)
                                                    }`}>
                                                    {'From: '}
                                                    {
                                                        moment(event.scheduledFrom).locale('en').format('DD MMM, hh:mm a')
                                                    }
                                                    {
                                                        event.scheduledTo && (
                                                            ` - ${moment(event.scheduledTo).isSame(event.scheduledFrom, 'day') ?
                                                                moment(event.scheduledTo).locale('en').format('hh:mm a') :
                                                                moment(event.scheduledTo).locale('en').format('DD MMM, hh:mm a')}`)
                                                    }
                                                </div>
                                            ) : (<div className="meeting-calendar-date no-schedule">
                                                No Schedule
                                                </div>)}
                                        </div>
                                    </div>

                                    <div className="meeting-detail-second-row">
                                        <div className="meeting-id-details">
                                            <div className="meeting-id-icon">
                                                <IconContext.Provider value={{
                                                    style: {
                                                        color: '#00C062'
                                                    }
                                                }}>

                                                    <FaRegAddressCard size={20} />
                                                </IconContext.Provider>
                                            </div>
                                            <div className="meeting-id" title={event.conferenceId}>{`ID: ${event.conferenceId}`}</div>
                                        </div>
                                        <div className="meeting-password-details">
                                            <div className="meeting-password-icon">
                                                {event.isSecretEnabled ? (
                                                    <IconContext.Provider value={{
                                                        style: {
                                                            color: '#00C062'
                                                        }
                                                    }}>

                                                        <FaLock size={15} />
                                                    </IconContext.Provider>
                                                ) : (
                                                        <IconContext.Provider value={{
                                                            style: {
                                                                color: '#D1D1D1'
                                                            }
                                                        }}>

                                                            <FaUnlock size={15} />
                                                        </IconContext.Provider>
                                                    )}
                                            </div>
                                            {event.isSecretEnabled ? (
                                                <div className="meeting-password" title={event.conferenceSecret}>{`Password : ${event.conferenceSecret}`}</div>
                                            ) : (<div className="meeting-password no-password">{`No Password`}</div>)}
                                        </div>
                                        <div className="meeting-waiting-room-details">
                                            <div className="meeting-waiting-room-icon">
                                                {event.isWaitingEnabled ? (
                                                    <IconContext.Provider value={{
                                                        style: {
                                                            color: '#00C062'
                                                        }
                                                    }}>

                                                        <HiCheckCircle size={20} />
                                                    </IconContext.Provider>
                                                ) : (
                                                        <IconContext.Provider value={{
                                                            style: {
                                                                color: '#D1D1D1'
                                                            }
                                                        }}>

                                                            <IoIosCloseCircle size={20} />
                                                        </IconContext.Provider>
                                                    )}
                                            </div>
                                            {event.isWaitingEnabled ? (
                                                <div className="meeting-waiting-room">Waiting Room</div>
                                            ) : (<div className="meeting-waiting-room no-waiting">Waiting Room</div>)}
                                        </div>
                                    </div>
                                    <div className="meeting-start">
                                        <div className="meeting-start-container" onClick={() => { handleClickStart(event.conferenceId); }}>Start</div>
                                    </div>
                                </div>
                            </div>
                            ))}
                </div>
            }
        </div>
    );
}


export default translate(ManageMeetings);
