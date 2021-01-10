import React, { useState, useEffect } from 'react';
import { IconContext } from 'react-icons';

import { BsInfo } from 'react-icons/bs';

/**
 *
 */
function TncPrivacy() {

    const [menuExpanded, setMenuExpanded] = useState(false);
    const wrapperRef = React.createRef();

    /**
     * Collapse if clicked on outside of element.
     */
    const handleClickOutside = event => {
        if (wrapperRef && wrapperRef.current
            && !wrapperRef.current.contains(event.target)) {
            setMenuExpanded(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    });

    return (<div
        className='tnc-privacy'
        onClick={() => setMenuExpanded(!menuExpanded)} >
        <IconContext.Provider value={{
            style: {
                color: 'white'
            }
        }}><div><BsInfo size={30} /></div>
        </IconContext.Provider>
        {
            menuExpanded
            && <ul
                className='tnc-privacy__menu'
                ref={wrapperRef}>
                <li>
                    <a
                        className='menuLabel'
                        href='/privacy-policy'
                        target='_blank'>Privacy Policy</a>
                </li>
                <li>
                    <a
                        className='menuLabel'
                        href='/TnC'
                        target='_blank'>Terms and Conditions</a>
                </li>
            </ul>
        }
    </div>);
}

export default TncPrivacy;
