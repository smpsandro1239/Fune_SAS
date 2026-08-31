import { SetMetadata } from '@nestjs/common';

export const LOG_AUDIT_KEY = 'log_audit';

export interface AuditOptions {
  action?: string;
  entity?: string;
  skip?: boolean;
}

export const Audit = (options: AuditOptions = {}) => SetMetadata(LOG_AUDIT_KEY, options);
