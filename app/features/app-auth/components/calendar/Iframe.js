import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const IFrame = ({
    children,
    head,
    ...props
}) => {
    const [ contentRef, setContentRef ] = useState(null);
    const mountHead
        = contentRef?.contentWindow?.document?.head;
    const mountNode
        = contentRef?.contentWindow?.document?.body;

    return (
        <iframe
            { ...props }
            ref = { setContentRef }>
            {mountHead && createPortal(head, mountHead)}
            {mountNode && createPortal(children, mountNode)}
        </iframe>
    );
};
