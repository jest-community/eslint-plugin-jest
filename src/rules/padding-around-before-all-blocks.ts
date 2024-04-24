import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.BeforeAllToken,
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.BeforeAllToken,
    nextStatementType: StatementType.Any,
  },
];

export default createPaddingRule(__filename, config);
