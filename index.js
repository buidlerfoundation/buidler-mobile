/**
 * @format
 */
//
import 'react-native-gesture-handler';
import '@ethersproject/shims';
import './shim';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
