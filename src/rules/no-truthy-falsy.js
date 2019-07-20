import {
  expectCaseWithParent,
  expectNotCase,
  expectRejectsCase,
  expectResolvesCase,
  getDocsUrl,
  method,
} from './util';

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      avoidMessage: 'Avoid {{methodName}}',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          expectCaseWithParent(node) ||
          expectNotCase(node) ||
          expectResolvesCase(node) ||
          expectRejectsCase(node)
        ) {
          const targetNode =
            node.parent.parent.type === 'MemberExpression' ? node.parent : node;

          const methodNode = method(targetNode);
          const { name: methodName } = methodNode;

          if (methodName === 'toBeTruthy' || methodName === 'toBeFalsy') {
            context.report({
              data: { methodName },
              messageId: 'avoidMessage',
              node: methodNode,
            });
          }
        }
      },
    };
  },
};
