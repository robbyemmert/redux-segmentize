/**
 * Include CSS
 * -----------
 * We do this here so that we can hot-reload it later with webpack-dev-server, and for simplicity in development.
 * In production, however, this needs to be included from the HTML file as a separate css file.
 */
import styles from './styles'; // eslint-disable-line no-unused-vars

// JavaScript dependencies
import React from 'react'; // eslint-disable-line no-unused-vars
import { render } from 'react-dom';

import {ReactComponent} from './export.js';

render((
    <div className="container">
        <div className="row">
            <div className="col-sm-12 header">
                <h1>Welcome to Webpack!</h1>
                <p>Feel free to start hacking!</p>
            </div>
            <div className="col-sm-12">
                <ReactComponent />
            </div>
        </div>
    </div>
), document.getElementById('react-wrapper'))
