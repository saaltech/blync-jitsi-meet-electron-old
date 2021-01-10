import React, {Component} from 'react';
import { Watermarks } from '../../base/react';

class Background extends Component {
    render() {
        const backgroundColor = {
            backgroundColor: this.props.backgroundColor || 'white' 
        }
        return (
            <>  
                {
                    this.props.backgroundColor &&
                    <div className='welcome-page-background' style={Object.assign({}, backgroundColor, {width: '100%'})}></div>
                }
                {
                    !this.props.backgroundColor &&
                    <>
                        <div className='welcome-page-background left-bg'></div>
                        <div className='welcome-page-background right-bg'></div>
                    </>
                }
                

                <div className = 'welcome-watermark'>
                    <Watermarks />
                </div>
            </>
        )
    }
}
export default Background