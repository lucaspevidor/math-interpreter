import { Equal, X } from "lucide-react"

import "./styles.css";
import { useState } from "react";

const InputBar = ({ exp: { expression, setExpression }, error }: {
  exp: {
    expression: string,
    setExpression: React.Dispatch<React.SetStateAction<string>>
  },
  error: boolean
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  return (
    <div className={
      "mainDiv" +
      (inputFocused ? " focused" : "")
    }>
      <input
        type="text"
        placeholder="32 * 4(5-2)^2"
        value={expression}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        onChange={e => setExpression(e.target.value)}
      />
      <div className={
        "iconDiv" +
        (error && expression.length !== 0 ? " error" : "")
      }>
        {
          error && expression.length !== 0 ?
            <X className="icon" strokeWidth={3} /> :
            <Equal className="icon" strokeWidth={3} />
        }
      </div>
    </div>
  );
}

export default InputBar;