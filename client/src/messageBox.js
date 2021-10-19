import React from "react";
import "./App.css";

export class MessageBox extends React.Component {
  render() {
    const boxStyle = {
      padding: "10px",
    };

    return (
      <div className="messageBox" id="msgBoxScrollBar">
        {this.props.waveListArray.map((wave, index) => {
          return (
            <div key={index} style={boxStyle}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    );
  }
}

MessageBox.defaultProps = {
  waveListArray: [
    {
      address: "test",
      timestamp: "Test date",
      message: "test message",
    },
    {
      address: "test",
      timestamp: "Test date",
      message: "test message",
    },
    {
      address: "test",
      timestamp: "Test date",
      message: "test message",
    },
    {
      address: "test",
      timestamp: "Test date",
      message: "test message",
    },
    {
      address: "test",
      timestamp: "Test date",
      message: "test message",
    },
  ],
};
