import { exec } from "child_process";
import pkg from "fs-extra";

const { copy, emptyDir, mkdir, promises: fs } = pkg;
import path from "node:path";
import { createInterface } from "readline";
import { commands } from "./listOfCommands.js";

const fgGreen = "\x1b[32m";
const fgCyan = "\x1b[36m";
const fgYellow = "\x1b[33m";
const fgOrange = "\x1b[38;5;208m";
const fgRed = "\x1b[31m";
const fgBlue = "\x1b[34m";
const fgMagenta = "\x1b[35m";

const PACKAGE_MANAGERS = ["npm", "yarn"];

const reset = "\x1b[0m";

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Promise<unknown>} { stdout: String, stderr: String }
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
 */
async function run(cmd: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Abort execution and print error message.
 * @param {String} msg
 * @see https://nodejs.org/api/process.html#process_process_exit_code
 */
function abort(msg: string): never {
  console.log(`${fgRed}${msg}${reset}`);
  process.exit(0);
}

/**
 * Ask user for input.
 * @param {String} question
 * @param {String[]} options
 * @param {String} defaultOption
 * @param {String} color
 * @return {Promise<String>}
 * @see https://nodejs.org/api/readline.html#readline_example_readline_question_async
 */
function ask(
  question: string,
  options: string[],
  defaultOption: string,
  color: string
): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  question = `${color}${question}`;

  if (options.length > 0) {
    const optionsString = options.join(" | ");
    if (defaultOption)
      question += ` ${fgYellow}(${optionsString}) [${fgOrange}${defaultOption}${fgYellow}]${color}: `;
    else question += ` ${fgYellow}(${optionsString})${color}: `;
  } else question += ": ";

  question += fgGreen;

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      let result = answer.trim();
      if (result === "") {
        if (defaultOption) result = defaultOption;
        else abort("No input provided.");
      } else if (options.length > 0 && !options.includes(result))
        abort(`Invalid option: ${answer}`);
      resolve(result);
    });
  });
}

let self = false;
let name: string;

let packageName = path.basename(path.resolve(process.cwd()));

if (process.argv[2]) name = process.argv[2];
else name = await ask("Project name", [], packageName, fgCyan);

if (name.includes(" ")) abort("No spaces allowed, exiting...");

if (name === ".") self = true;
else packageName = name;

const author = await ask(`Author`, [], "", fgCyan);

if (author.includes(" ")) abort("No spaces allowed, exiting...");

const packageManager = (
  await ask("Package Manager", PACKAGE_MANAGERS, "yarn", fgCyan)
).toLowerCase();

console.log(`\n${fgMagenta}Creating project...${reset}`);

if (self) {
  console.log(
    `${fgYellow}Warning: You are creating a project in the current directory.${reset}`
  );

  const directory = await fs.opendir(path.resolve(process.cwd()));
  const entry = await directory.read();
  await directory.close();
  if (entry) {
    const confirmDelete: string = await ask(
      "The current directory is not empty, do you want to continue? This will remove everything from it!",
      ["y", "n"],
      "n",
      fgRed
    );
    if (confirmDelete.toLowerCase() !== "y") abort("Exiting...");
    else {
      await emptyDir(path.resolve(process.cwd()));
    }
  }
} else
  try {
    await run(`cd ${name}`);
    const isDelete: string = await ask(
      "Project already exists. Would you like to overwrite it? This will remove everything from it!",
      ["y", "n"],
      "n",
      fgRed
    );
    if (isDelete.toLowerCase() === "y") await emptyDir(name);
    else abort("Exiting...");
  } catch (e) {
    console.log(`${fgGreen}Project does not exist, continuing...${reset}`);
  }

const __dirname = path.dirname(new URL(import.meta.url).pathname);
try {
  if (!self) await mkdir(packageName);
} catch (e) {
  console.log(`${fgGreen}Directory already exists, continuing...${reset}`);
}

await copy(
  `${__dirname}/../template/`,
  `${self ? "../" + packageName : packageName}`
);

for (const loopedCommand of commands) {
  let cmd = loopedCommand;
  try {
    if (cmd !== "pkg") {
      if (cmd === "git init") await run(`git init ${name}`);
      else if (cmd === "git finish") {
        await run(`git -C ./${name}/ add .`);
        await run(`git -C ./${name}/ commit -m "first commit"`);
      } else {
        if (cmd.includes("yarn")) {
          console.log(
            `${fgYellow}Installing dependencies using ${
              fgGreen + packageManager + fgYellow
            }...${reset}\n`
          );
          if (self) cmd = cmd.replace("--cwd .NAME. ", "");
          if (packageManager === "npm")
            cmd = cmd
              .replace("yarn --cwd", "npm --prefix")
              .replace("add -D", "i --save-dev");
          await run(cmd.replace(/\.NAME\./g, name));
        } else if (cmd.includes('"name": ".NAME."'))
          await run(
            cmd
              .replace(/\.NAME\./g, path.basename(path.resolve(process.cwd())))
              .replace(/\.AUTHOR\./g, author)
          );
        else
          await run(
            cmd.replace(/\.NAME\./g, name).replace(/\.AUTHOR\./g, author)
          );
      }
    } else {
      await run(
        `npm ${
          self ? "" : `--prefix ${name}`
        } pkg set name="${packageName}" && npm ${
          self ? "" : `--prefix ${name}`
        } pkg set version="1.0.0" && npm ${
          self ? "" : `--prefix ${name}`
        } pkg set author="${author}"`
      );
    }
  } catch (e) {
    abort(`Error while running ${cmd}: ${e}`);
  }
}

const NEXT_STEPS = {
  "cd .NAME.": "change directory to your project",
};

const AVAILABLE_SCRIPTS = {
  dev: "open up a development server",
  open: "shortcut for yarn build && yarn start",
  build: "build the project",
  start: "start the project",
  compile: "compile the typescript files into javascript",
  "compile:watch":
    "compile the typescript files into javascript on file change",
  lint: "find linting errors in the code",
  "lint:fix": "fix linting errors in the code",
  format: "reformat the code using prettier",
  "format:all": "reformat all files that prettier supports",
  prepare: "prepare husky hooks",
  "post-merge": "install dependencies, format all files and build the project",
  "pre-commit": "format all files and build the project",
};

console.log(
  `${fgGreen}Setup complete!\nNext step${
    Object.keys(NEXT_STEPS).length > 1 ? "s" : ""
  }:${reset} \n\n${Object.entries(NEXT_STEPS)
    .map(
      ([key, value]) =>
        `${reset}- ${fgBlue}${key.replace(/\.NAME\./g, name)}${reset} = ${
          fgYellow + value + reset
        }`
    )
    .join("\n")}
  ${reset}\n${fgGreen}Available Scripts:${reset}\n\n${Object.entries(
    AVAILABLE_SCRIPTS
  )
    .map(
      ([key, value]) =>
        `${reset}- ${fgBlue}${key}${reset} = ${fgYellow + value + reset}`
    )
    .join("\n")}\n`
);

process.exit(0);
