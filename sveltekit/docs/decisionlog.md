# Error Throwing and Handling

Expected errors (ex: post not found) are thrown inside services functions using SvelteKit's `error(statusCode: number, errorBody: App.Error)` function. This is because if we dont use their convention: `throw error` SvelteKit won't know the status code of the HTTP response and will result in a status code of 500. We could use a `handleError` hook which catches unexpected errors (errors that were not thrown using SvelteKit's custom `error` function) but is not able to change the status code before the response is sent.

# Environment Variables Usage - Duplicate .env file inside env/ folder

Modules can reference environment variables using a special alias $env. This is not compatible when running typescript files as `npx index.ts` nor during tests.

The solution: Created a file `env/envProvider.ts` which exports the values of all environment variables inside `env/.env`. Changed `tsconfig.ts`, `vite.config.js` and `vitest.config.js` adding the following path alias: `$envvars: "./env"`.

This allows typescript files to use environment variables by importing them in the following way: `import { DATABASE_URL } from "$envvars/envProvider";`

The downside is that we don't have all environment variables in a single file. We end up never accessing the environment variables inside `.env` (only those inside `env/.env`) but AuthJS needs some of them and cant get them through our environment variables provider: `env/envProvider.ts`

# Client-side validation on posts metadata and pages

Post metadata is validated right before sending the POST request to the server.

Post pages as constantly validated (client-side) in order to provide a better user experience. This way the user does not have to wait until hitting the "Create post" button to realize there's something wrong in the 4th question of his quiz on the 2nd page (for example).

# Dependencies usage

We use the NODE_ENV environment variable to determine which `services`, `data storage`, `blob storage` and `database client (prisma client)` will be used by the rest of the application. Every file that needs to use one of these should import it from `$lib/index.ts`. The NODE_ENV environment variable will used to choose the proper implementations for each environment. Currently we predict 3 environments: `development`, `test` and `production`.

# Authentication

A user which creates an account using OAuth (ex: Google) can later login using email authentication (magic link). The opposite is not true. Later we might add the possibility for a user that signed up using email authentication (magic link) to link his/her OAuth accounts.
