import type { KycCase } from '../../types/kyc';
import type { StepErrors } from '../../utils/money/kyc';

export interface KycStepProps {
  k: KycCase;
  set: (fn: (k: KycCase) => KycCase) => void;
  /** Only shown after the person tries to continue. */
  errors: StepErrors;
  disabled: boolean;
}