import { Config } from '../config.ts';

export interface AdditionalProps {
  noImplicitAdditionalProperties: Exclude<Config['noImplicitAdditionalProperties'], undefined>;
}
