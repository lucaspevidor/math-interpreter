import { Equal, X } from "lucide-react"

import "./styles.css";

const InputBar = ({ exp: { expression, setExpression }, error }: {
  exp: {
    expression: string,
    setExpression: React.Dispatch<React.SetStateAction<string>>
  },
  error: boolean
}) => {
  return (
    <div className="mainDiv">
      <input
        type="text"
        placeholder="32 * 4(5-2)^2"
        value={expression}
        onChange={e => setExpression(e.target.value)}
      />
      <div className={
        "iconDiv" +
        (error ? " error" : "")
      }>
        {
          error ?
            <X className="icon" strokeWidth={3} /> :
            <Equal className="icon" strokeWidth={3} />
        }
      </div>
    </div>
  );
}

export default InputBar;