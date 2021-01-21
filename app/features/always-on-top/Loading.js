import React from 'react';
import Logo from '../../../resources/images/logo.svg';
import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledLogo = styled(Logo)`
animation: ${rotate} infinite 20s linear;
display:block;
margin:auto;
`

function Loading(props) {
    return (
        <StyledLogo height={150} />
    )
}

export default Loading;