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
        const argument = node.parent.parent.arguments[0];

        if (
          (propertyName === 'toBe' || propertyName === 'toEqual') &&
          argument.value === null
        ) {
          context.report({
            fix(fixer) {
              return [
                fixer.replaceText(parentProperty, 'toBeNull'),
                fixer.remove(argument),
              ];
            },
            message: 'Use toBeNull() instead',
            node: parentProperty,
          });
        }
      }
    },
  };
};
