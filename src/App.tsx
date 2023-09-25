import { useState, useEffect } from "react";
import InputBar from "./components/input-bar";
import { Github } from "lucide-react";

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
      if (expression.length !== 0)
        setError(true);
    }
  }, [expression]);

  return (
    <main>
      <img src={Logo} alt="Logo" />
      <div className="inputBar">
        <InputBar exp={{ expression, setExpression }} error={error} />
      </div>
      <div className={
        "resultDiv" +
        (error ? " error" : "")
      }>
        <span>{
          expression.length === 0 ?
            "" :
            error ?
              "Invalid expression" :
              `= ${result}`
        }</span>
      </div>
      <div className="githubLink">
        <a href="https://github.com/lucaspevidor" target="_blank" rel="noopener noreferrer">
          <Github size={16} />
        </a>
      </div>
    </main>
  );
};

export default App;
