export function countReducer(state = 0, action) {
    switch(action.type) {
        case 'INCREMENT_COUNT':
            return state + action.amount;
        case 'DECREMENT_COUNT':
            return state - action.amount;
        case 'RESET_COUNT':
            return action.amount || 0;
    }

    return state;
}

export function customValue(state = 'Hey look! A custom value in the store!') {
    return state;
}