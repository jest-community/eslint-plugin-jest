import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.BeforeEachToken,
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.BeforeEachToken,
    nextStatementType: StatementType.Any,
  },
];

export default createPaddingRule(__filename, config);
