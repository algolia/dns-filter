import {
  validateURL, MalformedURLError, DNSResolveError, BlacklistedIPError,
} from './index';

describe('validateURL', () => {
  it('should allow a legit URL', async () => {
    const url = 'https://www.algolia.com';
    expect(await validateURL({ url })).toBe(true);
  });

  it('should throw a MalformedURLError on malformed urls', async () => {
    const url = 'someMalformedURL';

    await expect(validateURL({ url })).rejects.toBeInstanceOf(MalformedURLError);
  });

  it('should throw a DNSResolveError on non-existing urls', async () => {
    const url = 'http://this.will.not.resolve/';

    await expect(validateURL({ url })).rejects.toBeInstanceOf(DNSResolveError);
  });

  it('should throw a generic error, but report a precise one on blacklisted IP', async () => {
    const url = 'http://10.0.0.0/';
    await expect(validateURL({ url })).rejects.toBeInstanceOf(BlacklistedIPError);
  });
});
