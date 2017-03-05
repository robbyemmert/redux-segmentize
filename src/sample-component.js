import React from 'react';
import { segmentConnect } from './redux-segment';

const actions = {
    incrementCount: val => ({ type: 'INCREMENT_COUNT', amount: typeof val === 'number' ? val : 1 }),
    decrementCount: val => ({ type: 'DECREMENT_COUNT', amount: typeof val === 'number' ? val : 1 }),
    resetCount: val => {
        return { type: 'RESET_COUNT', amount: typeof val === 'number' ? val : 1 };
    }
}

const Counter = props => {
    return (
        <div className="counter">
            <button className="decrementer" onClick={() => props.decrementCount()}>-</button>
            <input type="tel" value={props.count} onChange={
                e => {
                    return props.resetCount(parseInt(e.target.value))
                }
                } />
            <button className="incrementer" onClick={() => props.incrementCount()}>+</button>
        </div>
    )
}

/**
 * Select Override: by default, the segment 
 * @param {object} state 
 */
function select(state) {
    return {
        customValue: state.customValue,
        count: state.count
    }
}

export default segmentConnect(select)(Counter, actions);