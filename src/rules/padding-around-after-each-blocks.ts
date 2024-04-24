import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.AfterEachToken,
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.AfterEachToken,
    nextStatementType: StatementType.Any,
  },
];

export default createPaddingRule(config);
