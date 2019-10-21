import { lookup } from 'dns';
import { URL } from 'url';
import { promisify } from 'util';

const dnsLookupPromisified = promisify(lookup);

export class CustomError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Generic error to not expose the attempted hack detection
export class NetworkError extends CustomError {
  constructor() {
    super('network_error');
  }
}

export class MalformedURLError extends CustomError {
  url: string;

  constructor(url: string) {
    super(`Malformed URL error: url could not be parsed`);
    this.url = url;
  }
}

/**
 * @param originalError - {Error} - Original error thrown by `dns.resolve`.
 * @param p - {Object} - Compound parameters.
 * @param p.fakeGenericError - {boolean} - Used to prevent leaking to
 *   the user we've detected a possible hack attempt.
 */
export class DNSResolveError extends CustomError {
  originalError: Error;

  constructor(originalError: Error) {
    super(`[FETCH][DNS] Resolving error: ${originalError.message}`);
    this.originalError = originalError;
  }
}

/**
 * @param url - {string} - URL provided to be resolved.
 * @param ip - {string} - Blacklisted IP.
 * @param p - {Object} - Compound parameters.
 * @param p.fakeGenericError - {boolean} - Used to prevent leaking to
 *   the user we've detected a possible hack attempt.
 */
export class BlacklistedIPError<T extends Record<string, any>> extends CustomError {
  url: string;
  restrictedIP: string;
  [name: string]: any;

  constructor(url: string, restrictedIP: string, context?: T) {
    super(`[FETCH][DNS] URL resolved to blacklisted IP`);
    this.url = url;
    this.restrictedIP = restrictedIP;
    if (context) {
      Object.keys(context).forEach((key) => {
        this[key] = context[key];
      })
    }
  }
}

const createBlacklistedIPError = <T extends Record<string, any>>(url: string, restrictedIP: string, context?: T): BlacklistedIPError<T> & T => {
  return new BlacklistedIPError(url, restrictedIP, context) as BlacklistedIPError<T> & T;
}

interface ValidationParams<T extends Record<string, any>> {
  url: string;
  context?: T;
  ipPrefixes?: string[];
}

export async function validateURL<T extends Record<string, any>>({ url, ipPrefixes = PRIVATE_IP_PREFIXES, context }: ValidationParams<T>) {
  let parsedURL: URL;
  try {
    parsedURL = new URL(url);
  } catch (e) {
    throw new MalformedURLError(url);
  }

  const hostname = parsedURL.hostname;

  let ip: string;
  try {
    const { address } = await dnsLookupPromisified(hostname);
    // I don't believe this can happen, but just in case
    if (typeof address !== 'string' || address.length === 0) {
      throw new Error('Invalid address');
    }
    ip = address;
  } catch (err) {
    throw new DNSResolveError(err);
  }

  if (isRestrictedIP(ip, ipPrefixes)) {
    throw createBlacklistedIPError<T>(url, ip, context);
  }

  return true;
}

// https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
// https://en.wikipedia.org/wiki/Private_network
export const PRIVATE_IP_PREFIXES = [
  // IPV4
  // in case we are in test or dev mode, we allow localhost resolution
  '127.',
  '0.',
  '10.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',
  '169.254.',
  // IPV6
  'fc',
  'fd',
  'fe',
  'ff',
  '::1',
];

function isRestrictedIP(ip: string, ipPrefixes: string[] = PRIVATE_IP_PREFIXES) {
  const sanitizedIP = ip.trim().toLowerCase();
  const matchesPrefix = (prefix: string) => sanitizedIP.startsWith(prefix);
  return ipPrefixes.some(matchesPrefix);
}