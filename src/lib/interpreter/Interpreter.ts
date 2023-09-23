function filter(expression: string) {
  return expression.replace(/\s+/g, "");
}

function tokenize(expression: string) {
  const tokens = expression
    .split(/(\+|-|\*|\/|\(|\)|\^)/)
    .filter((token) => !["", " "].includes(token))
    .map((token) => token.replace(",", ".").trim());

  for (let i = 0; i < tokens.length; i++) {
    if (
      tokens[i] === "-" &&
      !(
        i > 1 &&
        tokens.length >= i + 2 &&
        tokens[i - 2] === "(" &&
        tokens[i - 1] === "0" &&
        tokens[i + 1] === "1" &&
        tokens[i + 2] === ")"
      )
    ) {
      if (i > 1 && !IsOperator(tokens[i - 1])) tokens.splice(i++, 0, "+");
      tokens.splice(i++, 0, "(");
      tokens.splice(i++, 0, "0");
      i++;
      tokens.splice(i++, 0, "1");
      tokens.splice(i++, 0, ")");
      tokens.splice(i++, 0, "*");
    } else if (
      i > 0 &&
      tokens[i] === "(" &&
      (!IsOperator(tokens[i - 1]) || tokens[i - 1] === ")")
    ) {
      tokens.splice(i, 0, "*");
      i++;
    } else if (
      i !== tokens.length - 1 &&
      tokens[i] === ")" &&
      !IsOperator(tokens[i + 1])
    ) {
      tokens.splice(i + 1, 0, "*");
      i++;
    } else if (
      (i === 0 && tokens[i] === "-") ||
      (i > 0 && tokens[i] === "-" && tokens[i - 1] === "(")
    ) {
      tokens.splice(i, 0, "0");
      i++;
    }
  }

  return tokens;
}

function retokenize(tokens: string[]) {
  const newTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "(") {
      const closingParen = GetClosingParenthesisIndex(tokens.slice(i));
      if (!closingParen)
        throw new Error(
          "[Retokenize]Invalid expression (missing closing parenthesis)"
        );

      newTokens.push(
        tokens.slice(i, i + closingParen).reduce((acc, v) => acc + v)
      );
      i += closingParen - 1;
      continue;
    } else if (
      tokens[i].length > 1 &&
      tokens.length === 1 &&
      tokens[i].startsWith("(") &&
      tokens[i].endsWith(")")
    ) {
      return retokenize(tokenize(tokens[i]).slice(1, -1));
    }
    newTokens.push(tokens[i]);
  }

  return newTokens;
}

function GetClosingParenthesisIndex(tokens: string[]) {
  let p = 1;
  let i = 1;

  if (tokens[0] !== "(")
    throw new Error("[GetClosingParenthesisIndex] Invalid initial token");

  for (; i < tokens.length && p > 0; i++) {
    if (tokens[i] === "(") p += 1;
    else if (tokens[i] === ")") p -= 1;
  }

  if (p === 0) return i;
  return null;
}

function validate(expression: string, tokens: string[]) {
  const rgx = /^(\+|-|\*|\/|\(|\)|\^|\.|,|\d|-\d)+$/;
  if (!rgx.test(expression)) throw new Error("Invalid expression");

  // Validate if there are repeated operators and treat exceptions
  for (let i = 0; i < tokens.length - 1; i++) {
    if (IsOperator(tokens[i]) && IsOperator(tokens[i + 1])) {
      if (tokens[i + 1] === "(") continue;
      if (tokens[i] === ")") continue;

      throw new Error("Invalid expression");
    }
  }

  // Validate if all parenthesis are closed
  let p = 0;
  tokens.forEach((t) => {
    if (t === "(") p++;
    else if (t === ")") p--;
  });
  if (p !== 0) throw new Error("Invalid expression");

  const lastItem = tokens[tokens.length - 1];
  if (IsOperator(lastItem) && lastItem !== ")")
    throw new Error("Invalid expression");
}

export interface TreeNode {
  type: "operator" | "number";
  operator?: string;
  value?: string;
  children?: [TreeNode, TreeNode];
}

function buildTree(tokens: string[]): TreeNode {
  const precedence = ["-", "+", "*", "/", "^"];
  const retokens = retokenize(tokens);

  for (let i = 0; i < precedence.length; i++) {
    for (let k = retokens.length - 1; k >= 0; k--) {
      if (retokens[k] === precedence[i]) {
        const childrenLeft = buildTree(retokens.slice(0, k));
        const childrenRight = buildTree(retokens.slice(k + 1));
        return {
          type: "operator",
          operator: precedence[i],
          children: [childrenLeft, childrenRight],
        };
      }
    }
  }

  return {
    type: "number",
    value: retokens[0],
  };
}

function solveTree(node: TreeNode): number {
  if (node.type === "number") {
    if (!node.value) {
      throw new Error("[Solve tree]Invalid number node");
    }

    return Number.parseFloat(node.value);
  }

  if (
    !node.operator ||
    !node.children ||
    !node.children[0] ||
    !node.children[1]
  )
    throw new Error("[Solve tree]Invalid operator node");

  const v1 = solveTree(node.children[0]);
  const v2 = solveTree(node.children[1]);

  switch (node.operator) {
    case "+":
      return v1 + v2;
    case "-":
      return v1 - v2;
    case "*":
      return v1 * v2;
    case "/":
      return v1 / v2;
    case "^":
      return v1 ** v2;
    default:
      throw new Error("[Solve tree]Invalid operator");
  }
}

export function interpret(expression: string) {
  const filteredExp = filter(expression);
  const tokens = tokenize(filteredExp);
  validate(filteredExp, tokens);
  const retokens = retokenize(tokens);
  console.log({ retokens });

  const tree = buildTree(retokens);
  const res = solveTree(tree);

  return { res, tree };
}

function IsOperator(token: string) {
  return ["+", "-", "*", "/", "(", ")", "^"].includes(token);
}
