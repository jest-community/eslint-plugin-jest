import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.ExpectToken,
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.ExpectToken,
    nextStatementType: StatementType.Any,
  },
  {
    paddingType: PaddingType.Any,
    prevStatementType: StatementType.ExpectToken,
    nextStatementType: StatementType.ExpectToken,
  },
];

export default createPaddingRule(
  __filename,
  'Enforce padding around `expect` groups',
  config,
);
