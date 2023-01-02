# dns-filter
A small utility library to test whether requests try to access predefined IPs

**WARNING**
This project is not an officially maintained Algolia project.
This repository should not be used for any production project.
Bug reports and feature requests will most likely be ignored.

# Usage

```js
const { validateURL, NetworkError, PRIVATE_IP_PREFIXES } = require('@algolia/dns-filter');

const restricted = process.env.NODE_ENV === 'development'
  ? [] // allow everything in dev
  : PRIVATE_IP_PREFIXES; // no private IPs otherwise

const url = 'http://localhost/admin';
try {
  await validateURL({
    url,
    ipPrefixes: restricted,
    context: { some: 'metadata' },
  });
}
catch (err) {
  log.error(err); // log error
  throw new NetworkError(); // throw generic error
}
```

# Contributing

To release this package, wait for `semantic-release` to finish, then:
 - Make sure you're logged in with `npm login`
 - Run: 
```bash
yarn build
yarn publish
```
test
