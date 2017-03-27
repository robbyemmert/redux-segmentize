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
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import { segmentReducer, linkReducer } from './redux-segmentize';

import { Counter, CustomComponent, FlatStateCounter } from './sample-components';
import {
    countReducer,
    customValue,
    revisionCount
} from './sample-reducers';

const rootReducer = combineReducers({
    count: segmentReducer(countReducer),
    customValue,
    revisionCount: segmentReducer(revisionCount),
    flatCount: linkReducer(countReducer, 'linkedCounter')
});

const store = createStore(rootReducer);
window.s = store;

class CleanupTester extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        }
    }

    render() {
        let counter = this.state.show ? (<Counter />) : null;

        return (
            <div className="cleanupTester">
                <button onClick={() => this.setState({ show: !this.state.show })}>{ this.state.show ? 'Hide' : 'Show' }</button>
                { counter }
            </div>
        )
    }
}

render((
    <Provider store={store}>
        <div className="container">
            <div className="row">
                <div className="col-sm-12 header">
                    <h1>Welcome to Webpack!</h1>
                    <p>Feel free to start hacking!</p>
                </div>
                <div className="col-sm-12">
                    <h3>Sample Counters with Segmentize</h3>
                    <Counter />
                    <Counter subscriberID="customIdentifier" />
                    <Counter id="anotherCustomIdentifier" />
                    <Counter id="dontUseThisID" subscriberID="useThisID" />
                    <h3>Linked Counters</h3>
                    <Counter subscriberID="componentsLinked"/>
                    <Counter subscriberID="componentsLinked"/>
                    <h3>Linked Component</h3>
                    <CustomComponent />
                    <h3>Counters Using Linked Reducers (Flatter than Segmented Reducers)</h3>
                    <FlatStateCounter subscriberID="linkedCounter"/>
                    <h3>Clean up on unmount to prevent memory leaks</h3>
                    <CleanupTester />
                </div>
            </div>
        </div>
    </Provider>
), document.getElementById('react-wrapper'))
