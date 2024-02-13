import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
import legacy from './legacy';

export default {
  meta: { name: packageName, version: packageVersion },
  rules: legacy.rules,
  processors: legacy.processors,
};
