# Project Structure

```typescript
docs
  // Contains auto-generated API documentation: used types + endpoints
prisma
  // Contains the database scripts: createTables.sql and dropTables.sql
  // Also contains the prisma schema (generated from database introspection)
src
  app.html        // Base document template (present in all pages)
  hooks.server.ts // Universal middleware that runs on the server for every request
  app.d.ts        // Types for our application. Ex: Session, Error, PageData and Locals

  lib
    ...           // Code that is used in many places
    server        // Modules that can only run on code that runs on the server
      services
      data-storage
      blob-storage
      utils

  routes          // Web Server Endpoints (API endpoints + Page endpoints)
    api           // API Endpoints
      users
        [name]    // API handlers for this endpoint. Path that would match: /users/JohnDoe
    users
      [name]      // Serves the HTML page for a user

```

`+page.svelte` Contains the HTML skeleton for a page (the route is defined by the file path). This HTML can be influenced from `PageData` which is the object returned by the `load` function inside `+page.ts` (in the same directory).

`+layout.svelte` Contains the HTML skeleton for all pages in children routes. This HTML can be influenced from `LayoutData` which is the object returned by the `load` function inside `+layout.ts` (in the same directory).

<br/>

`+page.ts` Exports a function called `load` (as mentioned before) whose return value is passed to `+page.svelte` so that it can render the post contents, for example. This file can also export 3 variables: `prerender`, `csr` and `ssr` which determine how the page should be rendered.

`+layout.ts` Exports a function called `load` (as mentioned before) whose return value is passed to `+layout.svelte` so that it can render the name of the user in the navigation bar, for example. This file can also export 3 variables: `prerender`, `csr` and `ssr` which determine how the page should be rendered.

<br/>

`*.server.*` Files that contain code that will only run on the server (API keys and sensitive information can be accessed here).

<br/>

`+server.ts` File containing endpoints for a route that is defined depending on the filesystem path this file is on. If this file's path is `src/routes/api/users/[name]/profile/+server.ts` then all requests to `/api/users/[name]/profile` would be handled by this file handlers. This file contains handlers/functions, one per HTTP method we want to handle. Available HTTP methods are: **GET**, **POST**, **PUT**, **DELETE**, **PATCH**, **OPTIONS**
