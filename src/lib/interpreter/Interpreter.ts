function filter(expression: string) {
  return expression.replace(/\s+/g, "");
}

function tokenize(expression: string) {
  const tokens = expression
    .split(/(\+|-|\*|\/|\(|\)|\^)/)
    .filter((token) => !["", " "].includes(token))
    .map((token) => token.replace(",", "."));

  // detect unary - token
  for (let i = 0; i < tokens.length; i++) {
    if (
      tokens[i] === "-" &&
      (i === 0 || IsBinaryOperator(tokens[i - 1]))
    ) {
      tokens[i] = "um";
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (
      i > 0 &&
      tokens[i] === "(" &&
      (!IsBinaryOperator(tokens[i - 1]) || tokens[i - 1] === ")")
    ) {
      tokens.splice(i++, 0, "*");
    }

    else if (
      i !== tokens.length - 1 &&
      tokens[i] === ")" &&
      !IsBinaryOperator(tokens[i + 1])
    ) {
      tokens.splice(i + 1, 0, "*");
      i++;
    }
  }

  return tokens;
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
  const rgx = /^(\+|-|\*|\/|\(|\)|\^|\.|,|\d)*(\d|\))+$/;
  if (!rgx.test(expression)) throw new Error("Invalid expression");

  // Validate if there are repeated operators and treat exceptions
  for (let i = 0; i < tokens.length - 1; i++) {
    if (
      IsBinaryOperator(tokens[i]) && IsBinaryOperator(tokens[i + 1]) ||
      (IsUnaryOperator(tokens[i]) && IsUnaryOperator(tokens[i + 1])) ||
      (IsUnaryOperator(tokens[i]) && IsBinaryOperator(tokens[i + 1]))
    ) {
      if (tokens[i + 1] === "(") continue;
      if (tokens[i] === ")") continue;

      throw Error("Invalid expression");
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
  if (IsBinaryOperator(lastItem) && lastItem !== ")")
    throw new Error("Invalid expression");
}

export interface TreeNode {
  type: "operator" | "number";
  operator?: string;
  value?: string;
  children?: [TreeNode, TreeNode];
}

function buildTree(tokens: string[]): TreeNode {
  const precedence = ["+", "-", "um", "*", "/", "^"];

  if (tokens[0] === "(" && GetClosingParenthesisIndex(tokens) === tokens.length)
    tokens = tokens.slice(1, -1);

  for (let i = 0; i < precedence.length; i++) {
    for (let k = 0; k < tokens.length; k++) {
      if (tokens[k] === "(") {
        const closeP = GetClosingParenthesisIndex(tokens.slice(k));
        if (!closeP) throw Error("Invalid expression");

        k += closeP;
      }

      if (tokens[k] === precedence[i]) {
        const childrenLeft = buildTree(tokens.slice(0, k));
        const childrenRight = buildTree(tokens.slice(k + 1));
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
    value: tokens[0],
  };
}

function solveTree(node: TreeNode): number {


  if (node.type === "number") {
    if (!node.value) {
      return 0;
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
    case "um":
      return -1 * v2;
    default:
      throw new Error("[Solve tree]Invalid operator");
  }
}

export function interpret(expression: string) {
  const filteredExp = filter(expression);
  const tokens = tokenize(filteredExp);
  validate(filteredExp, tokens);
  const tree = buildTree(tokens);
  const res = solveTree(tree);
  return { res, tree };
}

function IsBinaryOperator(token: string) {
  return ["+", "-", "*", "/", "(", ")", "^"].includes(token);
}

function IsUnaryOperator(token: string) {
  return ["um"].includes(token)
}