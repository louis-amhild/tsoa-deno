import { Config, RoutesConfig } from '../config.ts';

export interface AdditionalProps {
  noImplicitAdditionalProperties: Exclude<Config['noImplicitAdditionalProperties'], undefined>;
  bodyCoercion: Exclude<RoutesConfig['bodyCoercion'], undefined>;
}
