import React from 'react';


class Hello extends React.Component {
  
  render () {
    return <div className='message-box'>
      Hello {this.props.name}
    </div>
  }
}