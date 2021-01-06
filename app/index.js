// @flow

/**
 * AtlasKit components will deflect from appearance if css-reset is not present.
 */
import '@atlaskit/css-reset';

import Spinner from '@atlaskit/spinner';
import { SpotlightManager } from '@atlaskit/onboarding';

import React, { Component, Suspense } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import './features/base/jitsi-local-storage/setup';

// Register middlewares and reducers.
import './features/calendar-sync/middleware';
import './features/app-auth/reducer';

import _createStore from './features/redux/store';

import { jitsiLocalStorage } from '@jitsi/js-utils';

import { App } from './features/app';
import { /*persistor,*/ store } from './features/redux';

import './i18n';

/**
 * Component encapsulating App component with redux store using provider.
 */
class Root extends Component<*> {

    constructor(props) {
        super(props);
        this.state = {
            store: null
        }
    }

     /**
     * Delays this {@code BaseApp}'s startup until the {@code Storage}
     * implementation of {@code localStorage} initializes. While the
     * initialization is instantaneous on Web (with Web Storage API), it is
     * asynchronous on mobile/react-native.
     *
     * @private
     * @returns {Promise}
     */
    _initStorage(): Promise<*> {
        const _initializing = jitsiLocalStorage.getItem('_initializing');

        return _initializing || Promise.resolve();
    }

    componentDidMount() {
        window.APP = {};

         /**
         * Make the mobile {@code BaseApp} wait until the {@code AsyncStorage}
         * implementation of {@code Storage} initializes fully.
         *
         * @private
         * @see {@link #_initStorage}
         * @type {Promise}
         */
        this._init = this._initStorage()
            .catch(err => {
                /* BaseApp should always initialize! */
                logger.error(err);
            })
            .then(() => new Promise(resolve => {
                this.setState({
                    store: _createStore()
                }, resolve);
            }))
            // .then(() => this.state.store.dispatch(appWillMount(this)))
            .catch(err => {
                /* BaseApp should always initialize! */
                logger.error(err);
            });
    }
    /**
     * Implements React's {@link Component#render()}.
     *
     * @returns {ReactElement}
     */
    render() {
        return (<>
            {
                this.state.store &&
                    <Provider store = { this.state.store }>
                        <SpotlightManager>
                            <Suspense fallback = { <Spinner /> } >
                                <App />
                            </Suspense>
                        </SpotlightManager>
                    </Provider>
            }
            </>
        );
    }
}

/**
 * Render the main / root application.
 *
 * $FlowFixMe.
 */
render(<Root />, document.getElementById('app'));
