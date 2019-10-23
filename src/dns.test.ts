import { validateURL, DNSResolveError } from './index';
import { lookup } from 'dns';

jest.mock('dns');

// this test suite describe scenarios where the attacker controls the DNS
// server for a particular request and returns ip addresses in uncommon
// encodings which are supported by the underlying network library
describe('dns attacks', () => {
  it('should reject on hex encoding', async () => {
    // @ts-ignore
    lookup.mockImplementation((...args) => {
      const cb = args.pop(); // last argument of lookup is callback
      cb(null, { address: '0x7f.0x0.0x0.0x1', family: 4 });
    });
    const url = 'http://127.0.0.1/';
    await expect(validateURL({ url })).rejects.toBeInstanceOf(DNSResolveError);
  });

  it('should reject on octal encoding', async () => {
    // @ts-ignore
    lookup.mockImplementation((...args) => {
      const cb = args.pop(); // last argument of lookup is callback
      cb(null, { address: '0177.0.0.01', family: 4 });
    });
    const url = 'http://127.0.0.1/';
    await expect(validateURL({ url })).rejects.toBeInstanceOf(DNSResolveError);
  });

  it('should reject on dword encoding', async () => {
    // @ts-ignore
    lookup.mockImplementation((...args) => {
      const cb = args.pop(); // last argument of lookup is callback
      cb(null, { address: '2130706433', family: 4 });
    });
    const url = 'http://127.0.0.1/';
    await expect(validateURL({ url })).rejects.toBeInstanceOf(DNSResolveError);
  });

  it('should reject on mixed encoding', async () => {
    // @ts-ignore
    lookup.mockImplementation((...args) => {
      const cb = args.pop(); // last argument of lookup is callback
      cb(null, { address: '0177.0.0.0x1', family: 4 });
    });
    const url = 'http://127.0.0.1/';
    await expect(validateURL({ url })).rejects.toBeInstanceOf(DNSResolveError);
  });
});
