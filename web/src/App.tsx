import React from "react";
import { render } from "react-dom";
import "./style.css";

interface IProp {
  apple: string;
}

const App: React.FunctionComponent<IProp> = (props) => {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  );
};

render(<App apple="green" />, document.getElementById("root"));