import { CustomError } from './Custom';

// Generic error to not expose the attempted hack detection
export class NetworkError extends CustomError {
  constructor() {
    super('network_error');
  }
}

export default { NetworkError };
