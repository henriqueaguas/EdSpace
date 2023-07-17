# SvelteKit Hybrid Page Rendering

### Important keywords used in this document

- `user` The person interacting with the webserver
- `client` The users' browser
- `render` The process of genrating the HTML that will be sent to the client
- `data` It is an object that will be passed to `+page.svelte`. It's usually used to get data from external sources and pass it to the page.
- `props` It is an object that is passed to Svelte components. It's usually used to share data between components. 
- `CSR` Client Side Rendering. When the job of producing the HTML happens on the client (browser).
- `Client Side Routing` When SvelteKit intercepts path changes to avoid that the browser requests the entire document once again. It then makes only the requests it needs to cause the page transition.
- `SSR` Server Side Rendering. When the job of producing the HTML happens on the server on every request.
- `PRERENDER` Pre rendering. When the job of producing the HTML happens on the server at build time. That rendered page is then faster to reach the users since the server does not need to render it again.
- `hydration` When the client receives a non-interactive/facade page from the server but the page needs interactivity. Hydration is a process in which the client makes the page interactive by rendering it and replacing the the non-interactive server page by the resulting HTML.

### SvelteKit Pages/Routes

SvelteKit has a filesystem-based routing.
Some of the files that make the route `/about` available are:

- `src/routes/about/+page.svelte` Contains the skeleton of the page (HTML + CSS + JAVASCRIPT)
- `src/routes/about/+page.ts` Contains a `load` function that returns an object called `data`. The `data` will be passed to `+page.svelte` to render it into the actual HTML.
- `src/routes/about/+layout.svelte` Contains a skeleton that will be present to the current page and all child routes

### Example

The following files will be used as an example to better understand SvelteKit rendering options.
SvelteKit will use these files to decide how to render and serve the page accessible at `/time`.

```javascript
// src/routes/time/+page.ts
// The options combination by default
// export const prerender = false;  // not important for now
export const csr = true;
export const ssr = true;

export const load = (async () => {
  // the promise will be resolved with the current UTC date(in ms) after 2 seconds the load function has been called
  const now: Promise<number> = new Promise((r) =>
    setTimeout(() => {
      const now = Date.now();
      console.log("Current time calculated", now);
      r(now);
    }, 2000)
  );

  return {
    time: now,
  };
}) satisfies PageLoad;

// +page.svelte
<script lang="ts">
  import type { PageData } from "./$types";

  // Extracting 'data' (output of the 'load' function)
  export let data: PageData;
</script>

// Using the 'data' object
<p>Current time: {data.time}</p>
```

Now we will explore the different combinations of the `csr`, `ssr` and `prerender` options.
It's important to take into account that these options are only used if the `page` that has them is the first requested page (the first page the client requests during it's session). The user could type on it's browser tab `https://www.yoursite.com/time`. This would cause the `csr`, `ssr` and `prerender` options defined **for `/time`** to be used. If the user instead first goes to `https://www.yoursite.com/` then the `csr`, `ssr` and `prerender` options defined **for `/`** will be used. If the user then, from inside the `/` page navigates to `/time` through the application interface and not by manually changing the URL input box of their browser, the 3 options will also be ignored and client side rendering will happen for the `/time` page, even if you have set `csr=false` for that page.

`To remember:` The `csr`, `ssr` and `prerender` options exist for every page and only take effect if it's the first page the user visits.

Another important thing to know is that SvelteKit tries to only send the client the files strictly needed. If the users' journey happens through pages that have `csr=false` no javascript will be sent to the browser (not even sveltekit-specific code) which means there is no client-side routing, which means client navigations between might not be as smooth as if it was client side routing. It also means the user is requesting an entire document every time, which means the next page the user navigates to is seen as the way the user entered the app, so the `csr`, `ssr` and `prerender` options will matter for that page. Once the user navigates to a page that has `csr=true` the sveltekit-specific code will be requested to the server as well as the entire document. From the moment that code is the the client, client side routing will happen and there won't be any more requests of the entire HTML document, only the parts it needs. For example, if the user has entered a `csr=true` page, navigating to another page will only request the javascript needed to render that page (if svelte-kit does not have them already).

`To remember:` As soon as the user enters a page with `csr=true` (is the default, for hydration) svelte uses client side routing and only requests the files required for the next pages so that it can render the page itself (always CS Render).

#### Default combination

```javascript
export const csr = true;
export const ssr = true;
```

#### If 1st request is to `/time`

- Stage 1 (Server Side Render): The `load` function from `+page.ts` will execute **on the server** returning an object. This `data` object will then be passed to `+page.svelte`, which will produce HTML that, in this example, will be `<p>Current time: st</p>` with `st` being the time seen by the server. This piece of HTML represents this page but since this is the 1st request the server it also sends the `src/app.html`(the app skeleton) where the placeholder `%sveltekit.body%` is replaced by the page HTML (static, non-interactive).

- Stage 2 (Hydration of the static HTML = Client Side Render)
  As soon as the HTML document(`src/app.html` with the `/time` Server Rendered page inside it) reaches the client it requests our page from the server but **NOT** the HTML! the javascript(`+page.svelte` and `+page.ts` compiled) that will allow the client to render the page itself (hydrate), making it interactive. This happens by executing the `load` function inside `+page.ts` (now on the client) generating a new `data` object, which will be passed to the `+page.svelte` page. This new client-side rendered version of the page replaces the server rendered version the user was seeing. The resulting HTML is `<p>Current time: st + x</p>` with `x` being the time between the server executing the `load` function and the client executing the `load` function.

Recap of what happens in this situation:

- The user requests the page
- The server waits 2 seconds, calculates the time `st`, produces the HTML with the text `st` and sends to client
- Client receives HTML and user sees `st` on the screen
- In the background the compiled `+page.ts` and `+page.svelte` are fetched from the server
- The javascript code inside those files is used to calculate the time again, now `st + x`, and produce/render new HTML
- Some svelte code replaces/hydrates the old HTML (given by the server, showing `st`) with the new HTML (client rendered , showing `st + x`)

---

```javascript
export const csr = true;
export const ssr = false;
```

#### If 1st request is to `/time`

This will cause the server to deliver the skeleton/base document (`src/app.html`), which then triggers the client to request javascript that will be used to render the actual page. On the client, the `load` function runs, calculating the `data` it will then use to render the page and make the resulting HTML visible to the user. From the user's perspective, the initial page load is faster, then the `load` function takes it's time and only then the HTML can be rendered with the awaited data and the user sees the missing HTML.

---

```javascript
export const csr = false;
export const ssr = true;
```

#### If 1st request is to `/time`

This will cause the HTML render to only happen on the server, meaning no hydration. The server sends to the client `src/app.html` with the `%sveltekit.body%` placeholder replaced by the result of rendering `+page.svelte` for the current route (`/time`). The client receives the HTML from the server and no further requests happen. Only one HTML document request is visible in the `Network` tab from the `Developer tools`. Not a single file of javascript is downloaded (not event `app.js` nor `start.js`). Since the client has no javascript, once the user navigates to a page that has `CSR=true` a redirect happens (not a smooth transition). Svelte tries to only send the client what it needs in the present moment.

`Note:` If the first page requested by the user has `CSR=true` (as in the example), the svelte-specific code (like `app.js` and `start.js`) are loaded and then intercept these redirections avoiding full page reloads in subsequent page navigations.

---

```javascript
export const csr = false;
export const ssr = false;
```

#### If 1st request is to `/test`

This is a strange combination! No page will be shown because no-one will render it.

#### If 1st request is to another page

Upon navigating from `/` to `/test`, for example, the client will request the javascript it needs to render the page itself. `CSR=false` only has impact if this is the first request to the server.

So far, we have looked at the CSR and SSR options. SvelteKit also supports `prerender`. When a `+page.ts` has `export const prerender = true` the corresponding page will be rendered at **build time**. In the example we have been using that means the time will be calculated when the build happens. Once client requests are made to the server, the HTML generated at build time is served without needing any render. All users receive the same page. This is much faster than SSR since the server does not have to re-render the page on every request, but instead serves a previously rendered page (at build time).

---

```javascript
export const prerender = true;
// export const csr = true; // default
// export const ssr = true; // default
```

With this configuration, the SSR option is ignored. CSR happens though.

If the 1st request is to a page with `PRERENDER=true` the static page will be server (rendered at build time) and then hydration happens on the client.
If the 1st request is to another page and then the user navigates to a page with `PRERENDER=true`, client-side rendering will happen, meaning the client will request the javascript it needs to be able to render the page by itself. The server does not serve the HTML rendered at build time!

---

```javascript
// /src/routes/test/+page.ts
export const prerender = true;
export const csr = false; // default
// export const ssr = true; // default
```

#### If 1st request is to `/test`

The HTML rendered at build time will be served and no hydration happens. The client will not render the page.
Since `CSR=true`, no javascript will be shipped to the client. The network tab only shows the HTML document that is the concatenation of `app.html` and the rendered `/test` page.

#### If 1st request is to another page

The HTML rendered at build time will not be sent to the client. Upon navigating from `/contacts` to `/test`, for example, the client will be the one rendering the page (even with `CSR=false`!).

### The hydration trigger

As mentioned before, if the 1st page the user requests does not require any javascript (`csr=false`), only the HTML document is delivered.
The moment the user navigates to a page that requires javascript a full-page reload happens requesting the HTML document. This document is different than the one from the 1st request (to a no-javascript page). Since `csr` (client side rendering) is enabled hydration will have to happen. SvelteKit-specific code is the responsible by this hydration. The document contains a `<script>` that will bring svelte files. Some of those files contain code that will help sveltekit to re-render/hydrate our page.  

```html
// base document(app.html) + page rendered by server (if ssr=true) + svelte hydration <script> 
<!-- In development this script is also included -->
<script>
  {
    __sveltekit_1vgssur = {
      env: {},
      base: new URL(".", location).pathname.slice(0, -1),
      element: document.currentScript.parentElement,
    };

    const data = [null, null];

    // Requesting sveltekit-specific files that will take over and provide client side routing and rendering capabilities for subsequent page navigations
    Promise.all([
      import("./_app/immutable/entry/start.6c89c8c4.js"),
      import("./_app/immutable/entry/app.e1943e2b.js"),
    ]).then(([kit, app]) => {
      // SvelteKit takes control
      kit.start(app, __sveltekit_1vgssur.element, {
        node_ids: [0, 2],
        data,
        form: null,
        error: null,
      });
    });
  }
</script>
```

When the client receives the HTML, the script tag will run and SvelteKit will take control of the user interface.

- If the `page.ts` has `export const csr=true` the client will hydrate the page (render it again, also running the `load` function again)

- If the `page.ts` has `export const csr=false` the client will not perform hydration and the page will remain non-interactive.

###### The kit.start function:

```javascript
export async function start(app, target, hydrate) {
  const client = create_client(app, target);

  init({ client });

  if (hydrate) {
    await client._hydrate(hydrate);
  } else {
    client.goto(location.href, { replaceState: true });
  }

  client._start_router();
}
```
