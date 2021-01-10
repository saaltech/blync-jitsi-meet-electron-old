// @flow

import { routerReducer } from 'react-router-redux';
import { ReducerRegistry } from '../redux';

ReducerRegistry.register('router', routerReducer)
