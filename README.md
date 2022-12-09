# ProjectGenerator

## A simple tool to generate all the boilerplate code for a new TypeScript project

### Usage

```bash
git clone https://github.com/AlonHor/ProjectGenerator.git
cd ProjectGenerator
rm -rf .eslintrc.json
rm -rf .git
npm install
npm run build
cd ..
node ProjectGenerator/dist/index.js
rm -rf ProjectGenerator
```

Or in one line:

```bash
git clone https://github.com/AlonHor/ProjectGenerator.git && cd ProjectGenerator && rm -rf .eslintrc.json && rm -rf .git && npm install && npm run build && cd .. && node ProjectGenerator/dist/index.js && rm -rf ProjectGenerator
```

### Features

- Generates a new TypeScript project with a simple `src` directory.
- Sets up `TypeScript`, `eslint`, `prettier`, `husky` and more automatically!
- Scaffolds a project in seconds!
- Comes with `nodemon` setup for development in watch mode.
- Comes with many useful scripts for development and production.

### License

MIT

### Author

[AlonHor](https://github.com/AlonHor) on GitHub
