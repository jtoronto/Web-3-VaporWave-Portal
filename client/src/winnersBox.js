import React from "react";
import "./App.css";

export class WinnersBox extends React.Component {
  render() {
    const boxStyle = {
      padding: "10px",
    };

    return (
      <div className="winnersBox" id="msgBoxScrollBar">
        Winners:
        {this.props.winnersList.map((winner, index) => {
          return (
            <div key={index} style={boxStyle}>
              <div>{winner}</div>
            </div>
          );
        })}
      </div>
    );
  }
}

WinnersBox.defaultProps = {
  winnersList: [],
};
