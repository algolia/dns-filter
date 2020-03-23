import { CustomError } from './Custom';

export class BlacklistedIPError<
  T extends Record<string, any>
> extends CustomError {
  url: string;

  restrictedIP: string;

  [name: string]: any;

  constructor(url: string, restrictedIP: string, context?: T) {
    super('[FETCH][DNS] URL resolved to blacklisted IP');
    this.url = url;
    this.restrictedIP = restrictedIP;
    if (context) {
      Object.keys(context).forEach((key) => {
        this[key] = context[key];
      });
    }
  }
}

export default { BlacklistedIPError };
