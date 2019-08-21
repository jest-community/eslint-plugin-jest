import requireToThrowMessage from './require-to-throw-message';

// remove this file in major version bump

export default {
  ...requireToThrowMessage,
  meta: {
    ...requireToThrowMessage.meta,
    deprecated: true,
    replacedBy: ['require-to-throw-message'],
  },
};
