import { lookup } from 'dns';
import { URL } from 'url';
import { promisify } from 'util';
import { Address6, Address4 } from 'ip-address';
import {
  BlacklistedIPError,
  DNSResolveError,
  MalformedURLError,
} from './errors';

const dnsLookupPromisified = promisify(lookup);

// https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
// https://en.wikipedia.org/wiki/Private_network
export const PRIVATE_IP_PREFIXES = [
  // IPV4
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

const createBlacklistedIPError = <T extends Record<string, any>>(
  url: string,
  restrictedIP: string,
  context?: T
): BlacklistedIPError<T> & T => {
  return new BlacklistedIPError(
    url,
    restrictedIP,
    context
  ) as BlacklistedIPError<T> & T;
};

interface ValidationParams<T extends Record<string, any>> {
  url: string;
  context?: T;
  ipPrefixes?: string[];
}

export async function validateURL<T extends Record<string, any>>({
  url,
  ipPrefixes = PRIVATE_IP_PREFIXES,
  context,
}: ValidationParams<T>) {
  let parsedURL: URL;
  try {
    parsedURL = new URL(url);
  } catch (e) {
    throw new MalformedURLError(url);
  }

  const { hostname } = parsedURL;

  let ip: string;
  try {
    const res = await dnsLookupPromisified(hostname);
    const { address, family } = res;
    // I don't believe this can happen, but just in case
    if (typeof address !== 'string' || address.length === 0) {
      throw new Error('Invalid address');
    }

    const formattedIP =
      family === 4 ? new Address4(address) : new Address6(address);

    if (!formattedIP.isValid()) {
      throw new Error('Invalid address');
    }

    ip = formattedIP.correctForm();
  } catch (err) {
    throw new DNSResolveError(err);
  }

  if (isRestrictedIP(ip, ipPrefixes)) {
    throw createBlacklistedIPError<T>(url, ip, context);
  }

  return true;
}

function isRestrictedIP(
  ip: string,
  ipPrefixes: string[] = PRIVATE_IP_PREFIXES
) {
  const sanitizedIP = ip.trim().toLowerCase();
  const matchesPrefix = (prefix: string) => sanitizedIP.startsWith(prefix);
  return ipPrefixes.some(matchesPrefix);
}

export { BlacklistedIPError, DNSResolveError, MalformedURLError };
