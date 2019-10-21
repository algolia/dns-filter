import { CustomError } from './Custom';

export class MalformedURLError extends CustomError {
  url: string;

  constructor(url: string) {
    super('Malformed URL error: url could not be parsed');
    this.url = url;
  }
}

export default { MalformedURLError };
