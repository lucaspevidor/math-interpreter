import { useState, useEffect } from "react";
import InputBar from "./components/input-bar";

import { interpret } from "./lib/interpreter/Interpreter"

import Logo from "./assets/Logo.svg";
import "./App.css";

const App = () => {
  const [expression, setExpression] = useState("");
  const [error, setError] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    try {
      setError(false);
      const res = interpret(expression);
      setResult(res.res);
    } catch (e) {
      setError(true);
    }
  }, [expression]);

  return (
    <main>
      <img src={Logo} alt="Logo" />
      <InputBar exp={{ expression, setExpression }} error={error} />
      <div className={
        "resultDiv" +
        (error ? " error" : "")
      }>
        <span>{
          error ?
            "Invalid expression" :
            `= ${result}`
        }</span>
      </div>
    </main>
  );
};

export default App;
