import { CustomError } from './Custom';

export class DNSResolveError extends CustomError {
  originalError: Error;

  constructor(originalError: Error) {
    super(`[FETCH][DNS] Resolving error: ${originalError.message}`);
    this.originalError = originalError;
  }
}

export default { DNSResolveError };
