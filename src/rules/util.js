export const argument = node =>
  node.parent.parent.arguments && node.parent.parent.arguments[0];
