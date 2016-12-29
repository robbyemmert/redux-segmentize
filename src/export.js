/**
 * This file defines what people get when they `import {...} from 'your-package'
 */

import React from 'react';

export class ReactComponent extends React.Component {
    render() {
        return (
            <div id={this.props.id} className={['component-react-component', this.props.className].join(' ')}>
                <img src="/img/thumbs-up.png" width="250" />
            </div>
        )
    }
}