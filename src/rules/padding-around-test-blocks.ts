import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: [
      StatementType.TestToken,
      StatementType.ItToken,
      StatementType.FitToken,
      StatementType.XitToken,
      StatementType.XtestToken,
    ],
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: [
      StatementType.TestToken,
      StatementType.ItToken,
      StatementType.FitToken,
      StatementType.XitToken,
      StatementType.XtestToken,
    ],
    nextStatementType: StatementType.Any,
  },
];

export default createPaddingRule(__filename, config);
