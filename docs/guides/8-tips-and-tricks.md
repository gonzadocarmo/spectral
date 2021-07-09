# Tips & Tricks

## $ref resolving

### Symlinked files

```js
// my-resolver.js
"use strict";
const fs = require("fs");
const path = require("@stoplight/path");
const { Resolver } = require("@stoplight/spectral-ref-resolver");

module.exports = new Resolver({
  resolvers: {
    file: {
      async resolve(uri) {
        let ref = uri.href();
        try {
          ref = path.join(path.dirname(ref), await fs.promises.readlink(ref, "utf8"));
        } catch (e) {
          if (e.code === "EINVAL") {
            // not a symlink
          } else {
            throw e;
          }
        }

        return fs.promises.readFile(ref, "utf8");
      },
    },
  },
});
```

then, if you're a CLI user you can refer to that resolver in the following manner:

```bash
spectral lint --resolver my-resolver.js my-document
```

For JS API consumers, this would look like this:

```js
"use strict";
const { Spectral } = require("@stoplight/spectral-core");
const MyResolver = require("./my-resolver.js");

const spectral = new Spectral({
  resolver: MyResolver,
});
```
