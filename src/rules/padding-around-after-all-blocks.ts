import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.AfterAllToken,
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.AfterAllToken,
    nextStatementType: StatementType.Any,
  },
];

export default createPaddingRule(__filename, config);
