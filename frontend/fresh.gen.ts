// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/_404.tsx";
import * as $1 from "./routes/dashboard.tsx";
import * as $2 from "./routes/index.tsx";
import * as $3 from "./routes/login.tsx";
import * as $4 from "./routes/register.tsx";
import * as $$0 from "./islands/LoadMath.tsx";
import * as $$1 from "./islands/Message.tsx";

const manifest = {
  routes: {
    "./routes/_404.tsx": $0,
    "./routes/dashboard.tsx": $1,
    "./routes/index.tsx": $2,
    "./routes/login.tsx": $3,
    "./routes/register.tsx": $4,
  },
  islands: {
    "./islands/LoadMath.tsx": $$0,
    "./islands/Message.tsx": $$1,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
