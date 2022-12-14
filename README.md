# ProjectGenerator

### Installation

```bash
wget -q https://github.com/AlonHor/ProjectGenerator/releases/download/v1.0.0/createts-setup # Download the setup file
chmod +x createts-setup # Make the file executable
./createts-setup # Run the setup script and follow the instructions
rm createts-setup # Remove the setup script after installation
```

Or in one line:

```bash
wget -q https://github.com/AlonHor/ProjectGenerator/releases/download/v1.0.0/createts-setup && chmod +x createts-setup && ./createts-setup && rm createts-setup
```

That's it! Follow the instructions, and you're good to go!<br />
After the installation, you can run the tool by typing `createts` in your terminal.

### Build from source

```bash
git clone https://github.com/AlonHor/ProjectGenerator.git
cd ProjectGenerator
rm -rf .eslintrc.json
npm install
npm run build
cd ..
node ProjectGenerator/dist/index.js
rm -rf ProjectGenerator
```

Or in one line:

```bash
git clone https://github.com/AlonHor/ProjectGenerator.git && cd ProjectGenerator && rm -rf .eslintrc.json && npm install && npm run build && cd .. && node ProjectGenerator/dist/index.js && rm -rf ProjectGenerator
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
