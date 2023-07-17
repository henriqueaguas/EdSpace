# Available Scripts

> Scripts are run using `npm run <script_name>`

### Start Development Mode

`dev`

### Build

`build`

### Preview (uses the built code)

`preview`

### Run Unit tests (uses vitest)

`test`

### Run Typescript Checks (helps catch import/export and type errors)

`tc`

### Generate API documentation for svelte endpoints

`api:docs`

### Initialize database with topics

`db:remove` // removes the postgresql docker container

`db:create` // create docker container with 2 dbs(test and prod) + create tables + initialize dbs + generate mock data for the test db

### Generate Prisma Type-Safe ORM from the existing DB schema (introspection)

`db:pull`

### Open Simple DB visualizer

`db:view`
