import { PaddingType, StatementType, createPaddingRule } from './utils/padding';

export const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: [
      StatementType.DescribeToken,
      StatementType.FdescribeToken,
      StatementType.XdescribeToken,
    ],
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: [
      StatementType.DescribeToken,
      StatementType.FdescribeToken,
      StatementType.XdescribeToken,
    ],
    nextStatementType: StatementType.Any,
  },
];

export default createPaddingRule(config);
