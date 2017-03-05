export function incrementCount(val) {
    return {
        type: 'INCREMENT_COUNT',
        amount: typeof val === 'number' ? val : 1
    }
}

export function decrementCount(val) {
    return {
        type: 'DECREMENT_COUNT',
        amount: typeof val === 'number' ? val : 1
    }
}

export function resetCount(val) {
    return {
        type: 'RESET_COUNT',
        amount: typeof val === 'number' ? val : 1
    }
}