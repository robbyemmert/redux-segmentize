import React from 'react';
import { connect } from 'react-redux';
import { segmentConnect, extractProp } from './redux-segmentize';

const counterActions = {
    incrementCount: val => ({ type: 'INCREMENT_COUNT', amount: typeof val === 'number' ? val : 1 }),
    decrementCount: val => ({ type: 'DECREMENT_COUNT', amount: typeof val === 'number' ? val : 1 }),
    resetCount: val => ({ type: 'RESET_COUNT', amount: typeof val === 'number' ? val : 1 })
}

const BaseCounter = props => {
    return (
        <div className="counter">
            <div className="controls">
                <button className="decrementer" onClick={() => props.decrementCount()}>-</button>
                <input type="tel" value={props.count} onChange={e => props.resetCount(parseInt(e.target.value))} />
                <button className="incrementer" onClick={() => props.incrementCount()}>+</button>
            </div>
            <div className="info">
                Number of adjustments: { props.revisionCount }
            </div>
        </div>
    )
}

function select(state) {
    return {
        customValue: state.customValue,
        revisionCount: state.revisionCount,
        count: state.count
    }
}

export const Counter = segmentConnect(select)(BaseCounter, counterActions);

function flatStateSelect(state) {
    return {
        count: state.flatCount,
        customValue: state.customValue,
        revisionCount: state.revisionCount
    }
}

export const FlatStateCounter = segmentConnect(flatStateSelect)(BaseCounter, counterActions);

export const CustomComponentBase = props => {
    return (
        <div>
            The custom counter we need to manually link to: {props.count}
        </div>
    )
}

export const CustomComponent = connect(state => ({ 
    count: extractProp(state.count, 'customIdentifier') 
}))(CustomComponentBase);