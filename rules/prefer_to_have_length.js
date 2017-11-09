'use strict';

module.exports = context => {
  return {
    CallExpression(node) {
      const calleeName = node.callee.name;

      if (
        calleeName === 'expect' &&
        node.arguments.length == 1 &&
        node.parent &&
        node.parent.type === 'MemberExpression' &&
        node.parent.parent
      ) {
        const parentProperty = node.parent.property;
        const propertyName = parentProperty.name;
        const argumentObject = node.arguments[0].object;
        const argumentProperty = node.arguments[0].property;

        if (
          (propertyName === 'toBe' || propertyName === 'toEqual') &&
          argumentProperty &&
          argumentProperty.name === 'length'
        ) {
          const propertyDot = context
            .getSourceCode()
            .getFirstTokenBetween(
              argumentObject,
              argumentProperty,
              token => token.value === '.'
            );
          context.report({
            fix(fixer) {
              return [
                fixer.remove(propertyDot),
                fixer.remove(argumentProperty),
                fixer.replaceText(parentProperty, 'toHaveLength'),
              ];
            },
            message: 'Use toHaveLength() instead',
            node: parentProperty,
          });
        }
      }
    },
  };
};
