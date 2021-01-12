import React from 'react';
import { IconContext } from 'react-icons';

export default function ButtonWithIcon(props) {
    const { className = '', source, onButtonClick, backGroundColor = '', IconComponent = {}, labelText } = props;

    return (
        <div onClick={onButtonClick} className={`buttonWithIconComponent ${className}`}>
            <span className="button-with-icon__icon">
                <img className="image-wrapper" src={`../resources/images/${source}`} alt={source}/>
                {/* <IconContext.Provider value={{
                    style: {
                        color: IconComponent.color,
                    }
                }}>
                    <IconComponent.component size={IconComponent.size} />
                </IconContext.Provider> */}
            </span>
            <span className="button--label">
                {labelText}
            </span>
        </div>
    )
}