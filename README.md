<p align="center">
  <a href="https://psykzz.github.io/planning-poker">
  </a>
</p>
<h1 align="center">
  Planning Poker
</h1>

A planning poker application built with Next.js and React.

_Have an idea you want to suggest? Pull requests are welcome._

## 🚀 Quick start

### Next.js (Primary Framework)

1.  **Start developing.**

    Clone the repo, and start developing.

    ```shell
    git clone <url> .
    npm install
    npm run dev
    ```

2.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:3000/planning-poker`!

    Any changes you make will be updated in real time!

### Vite (Alternative Development)

For faster development builds, you can optionally use Vite:

```shell
npm run vite:dev
```

This will run on `http://localhost:3001/planning-poker`

## 📦 Build and Deploy

### Next.js Build

```shell
npm run build
npm run start
```

### Vite Build

```shell
npm run vite:build
npm run vite:preview
```


### Netlify Deployment

The repo includes a `netlify.toml` that configures Netlify to build with Next.js using the [Essential Next.js plugin](https://github.com/opennextjs/opennextjs-netlify):

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Netlify will automatically install `@netlify/plugin-nextjs` at build time — no manual install needed. Connect the repo in the Netlify dashboard and it will pick up the config automatically.

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in this Next.js project.

    .
    ├── node_modules
    ├── pages
    ├── src
    ├── static
    ├── .gitignore
    ├── .prettierrc
    ├── eslint.config.js
    ├── next.config.mjs
    ├── netlify.toml
    ├── vite.config.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    └── README.md

1.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

2.  **`/pages`**: Next.js pages directory. Each file becomes a route in the application.

3.  **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for "source code".

4.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

5.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

6.  **`eslint.config.js`**: ESLint flat config using `eslint-config-next`.

7.  **`next.config.mjs`**: Next.js configuration — sets the base path, asset prefix, and packages to transpile.

8.  **`netlify.toml`**: Netlify build configuration — tells Netlify to run `next build` and publish from `.next` using the Next.js plugin.

9.  **`vite.config.js`**: Optional Vite configuration for alternative development builds.

10. **`LICENSE`**: This project is licensed under the 0BSD license.

11. **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won't change this file directly).**

12. **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project's name, author, etc). This manifest is how npm knows which packages to install for your project.

13. **`README.md`**: A text file containing useful reference information about your project.
