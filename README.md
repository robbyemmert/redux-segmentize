# Redux Segmentize
By: Robby Emmert

Automatically manage component-based state with redux.

The recommended Container/Component setup is nice, but sometimes you need to re-use components throughout your app that need to manage their own state.  Setting up separate reducers for each instance of these components is a pain.  Now you can manage them automatically.  Set your reducer up once, then re-use it for each component instance.

### Installation
`npm install --save redux-segmentize`

### Step 1: Segmentize your Reducers
Build your reducers the way you would for managing just one instance, then wrap them like so with `segmentReducer()`:

```javascript
import { segmentReducer } from 'redux-segmentize';

function clicksReducer(state = 0, action) {
    switch(action.type) {
        case 'CLICK_COOL_BUTTON':
            return state + 1
    }

    return state;
}

const rootReducer = combineReducers({
    clicks: segmentReducer(clicksReducer),
    ...
});
```

### Step 2: Binding components to segmentized reducers
Build your components as you normally would.  Use `segmentConnect` instead of `react-redux`'s `connect`.  Segment connect detects which props are segments, then it sets up a new property within that segment where it can store values for the state of your component.  For example:

```javascript
import React from 'react';
import { segmentConnect } from 'redux-segmentize';

const CoolButton = props => {
    return (
        <div className="cool-button-component">
            <button>Push me</button>
            <div>Clicked { clicks } times.</div>
        </div>
    )
}

const select = state => {
    return {
        clicks: state.clicks
    }
}

export default segmentConnect(select)(BaseCounter);
```
Literally the only thing you need to change at this point is to use `segmentConnect` instead of `react-redux`'s `connect`.

### Step 3: Update segmentized state
Using normal actions can be a problem, since at this point, nothing will differentiate actions dispatched by each instance of `CoolButton`.  Once again, set up your actions as you normally would.  Then, instead of referencing them directly, you can inject them into your component's props via `segmentConnect`.  Then you can reference them from props.  

```javascript
import React from 'react';
import { segmentConnect } from 'redux-segmentize';

const actions = {
    click: () => ({ type: 'CLICK_COOL_BUTTON' })
}

const CoolButton = props => {
    return (
        <div className="cool-button-component">
            <button onClick={props.click()}>Push me</button>
            <div>Clicked { props.clicks } times.</div>
        </div>
    )
}

const select = state => {
    return {
        clicks: state.clicks
    }
}

export default segmentConnect(select)(BaseCounter, actions);
```

Notice, we've updated the onClick listener for the button.  Also, dispatch is automatically called for you.  In this case, executing the `click` function will dispatch your click event, appending a `subscriberID` attribute to the resulting object with the id of your component (it uses the `id` prop if available, otherwise it generates a unique identifier).  Your segmented reducer then applies that action to your reducer, storing the resulting value under your component's identifier, within your segment.  Your component also looks up that value with the same identifier.

Now you can simply use your component anywhere in your app, and it will automatically manage it's own state in Redux.  For example:

```javascript
<CoolButton />
<CoolButton />
<CoolButton />
<CoolButton />
<CoolButton />
<CoolButton />
<CoolButton />
etc.
```

Each instance of `CoolButton` has it's own place in your store, and fires it's own actions, all using the same code for your actions and reducer.

### Extracting values from segments, using normal components and react-redux
If you want another component to extract values from your segments (say, to make an AJAX request with), you can use the `extractProp` function.

First, you'll need to add a `subscriberID` prop (Alternatively `id` works as well) to your instance of `CoolButton` you want to report on.
```javascript
<CoolButton subscriberID="cool-button-1"/>
```

Next, let's set up the reporting component.

```javascript
import React from 'react';
import { extractProp } from 'redux-segmentize';
import { connect } from 'react-redux';

const actions = {
    myCustomReportingAction: clicks => ({ type: 'REPORT_CLICKS', amount: clicks })
}

const ReportClicks = props => {
    return (
        <div className="reportClicks">
            <button onClick={props.dispatch(actions.myCustomReportingAction(props.clicks))}>Report {props.clicks} to the server</button>
        </div>
    )
}

const select = state => {
    return {
        clicks: extractProp(state.clicks)
    }
}

export default connect(select)(ReportClicks);
```

### Extracting values from segments using segmentConnect
Alternatively, you can simply use segmentConnect on your reporting component as well, and just assign both the CoolButton and reporting component the same `subscriberID`:

```javascript
<CoolButton subscriberID="coolClicks"/>
<ReportClicks subscriberID="coolClicks"/>

...

import React from 'react';
import { extractProp, segmentConnect } from 'redux-segmentize';

const actions = {
    myCustomReportingAction: clicks => ({ type: 'REPORT_CLICKS', amount: clicks })
}

const ReportClicks = props => {
    return (
        <div className="reportClicks">
            <button onClick={props.myCustomReportingAction(props.clicks)}>Report {props.clicks} to the server</button>
        </div>
    )
}

const select = state => {
    return {
        clicks: extractProp(state.clicks)
    }
}

export default segmentConnect(select)(ReportClicks, actions);
```