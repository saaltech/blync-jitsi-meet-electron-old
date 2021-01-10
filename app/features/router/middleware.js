// @flow

import { routerMiddleware } from 'react-router-redux';
import MiddlewareRegistry from '../redux/MiddlewareRegistry';

import history from './history';

MiddlewareRegistry.register(routerMiddleware(history));
