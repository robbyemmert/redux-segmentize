import React from 'react';
import { connect } from 'react-redux';

function generateUUID () { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


const INIT = 'REDUX_SEGMENT_INIT_COMPONENT';

// Actions
const initializeComponent = (id, watchingIds) => ({ type: INIT, subscriberID: id, watchingIds });

var options = Object.assign({
    idArg: 'instanceID',
    nameArg: 'segmentName',
    subscriberIDFunc: props => props.subscriberID || props.id || generateUUID()
}, options);

export function segmentConnect(...maps) {
    const connector = connect(...maps);

    return (Component, actions) => {

        class SegmentedComponent extends React.Component {
            constructor(props) {
                super(props);

                this.state = {
                    subscriberID: null,
                    watchingSegments: []
                }
            }

            componentWillMount() {
                // Figure out which segments we are watching
                let watchingSegments = [];
                let subscriberID = options.subscriberIDFunc(this.props);
                let bundledActions = {};

                // Figure out which segments we are related to via props.  Tell the segments we exist.
                Object.keys(this.props).forEach(propKey => {
                    let prop = this.props[propKey];
                    if (typeof prop === 'object' && prop.isSegment) {
                        watchingSegments.push({
                            prop: propKey,
                            segmentID: prop.segmentID
                        });
                    }
                });

                // Modify actions to report the subscriberID of this component so they can be properly identified by the segmented reducers.
                Object.keys(actions).forEach(actionKey => {
                    let action = actions[actionKey];
                    bundledActions[actionKey] = (...args) => {
                        return this.props.dispatch(Object.assign({}, action(...args), {
                            subscriberID
                        }));
                    }
                });

                this.setState({ subscriberID, watchingSegments, actions: bundledActions });
                this.props.dispatch(initializeComponent(subscriberID, watchingSegments.map(seg => seg.segmentID)));
            }

            reduceSegmentedProps(props) {
                let segmentedProps = {};
                this.state.watchingSegments.forEach(seg => {
                    let segment = props[seg.prop];
                    segmentedProps[seg.prop] = extractProp(segment, this.state.subscriberID);
                });
                return segmentedProps;
            }

            render() {
                let bundleProps = Object.assign({}, this.state.actions, this.props, this.reduceSegmentedProps(this.props));

                return (
                    <Component {...bundleProps}></Component>
                )
            }
        }

        return connector(SegmentedComponent)
    }
}

export function segmentReducer(reducer) {

    return (state, action) => {

        state = state || {
            isSegment: true,
            segmentID: generateUUID(),
            instances: {},
            defaultValue: reducer(undefined, action)
        }

        let isActionFromSubscriber = state.instances.hasOwnProperty(action.subscriberID);
        let isNewSubscriber = action.type === INIT && Array.isArray(action.watchingIds) && action.watchingIds.indexOf(state.segmentID) >= 0;

        if (isNewSubscriber || isActionFromSubscriber) {
            return Object.assign({}, state, {
                instances: Object.assign({}, state.instances, {
                    [action.subscriberID]: reducer(state.instances[action.subscriberID], action)
                })
            });
        }

        return state;
    }
}

export function linkReducer(reducer, subscriberID) {
    return (state, action) => {
        state = state || {
            isSegment: true,
            isFlatSegment: true,
            segmentID: generateUUID(),
            subscriberID: subscriberID,
            value: reducer(undefined, action),
            defaultValue: reducer(undefined, action)
        }

        let isActionFromSubscriber = action.subscriberID === subscriberID;

        if (isActionFromSubscriber) {
            return Object.assign({}, state, {
                value: reducer(state.value, action)
            });
        }

        return state;
    }
}

export function extractProp(prop, key) {

    if (prop && typeof prop.instances === 'object') {
        return prop.instances.hasOwnProperty(key) ? prop.instances[key] : prop.defaultValue;
    } else if (prop.isFlatSegment) {
        return prop.value;
    }

    return undefined;
}

/**
 * Wrap an action creater to always append a subscriber ID to resulting actions.
 * @param {function} action The action to wrap 
 * @param {string} subscriberID The subscriber ID to append
 */
export function segmentAction(action, subscriberID) {
    return (...args) => {
        let actionObj = action(...args);
        return Object.assign({}, actionObj, {
            subscriberID
        });
    }
}

/**
 * Wrap a hash of action creator functions to always append a subscriber ID to resulting actions.
 * @param {object} actions A hash of functions to wrap 
 * @param {string} subscriberID The subscriber ID to append to all resulting actions 
 */
export function segmentActions(actions, subscriberID) {
    let out = {};
    Object.keys(actions).forEach(key => {
        let action = actions[key];
        out[key] = segmentAction(action, subscriberID);
    });

    return out;
}