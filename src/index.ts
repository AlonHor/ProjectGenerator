import { exec } from "child_process";
import pkg from "fs-extra";
const { copy, emptyDir, mkdir, promises: fs } = pkg;
import path from "node:path";
import { createInterface } from "readline";
import { commands } from "./listOfCommands.js";

const fgGreen = "\x1b[32m";
const fgCyan = "\x1b[36m";
const fgYellow = "\x1b[33m";
const fgRed = "\x1b[31m";
const fgBlue = "\x1b[34m";
const fgMagenta = "\x1b[35m";

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

function abort(msg: string): never {
  console.log(`${fgRed}${msg}${reset}`);
  process.exit(1);
}

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

let self = false;
let name = "";

let packageName = path.basename(path.resolve(process.cwd()));

if (process.argv[2]) name = process.argv[2];
else {
  const pName: string = await new Promise((resolve) => {
    readline.question(`${fgCyan}Project Name: ${fgGreen}`, resolve);
  });
  name = pName.trim();
}

if (!name) abort("No name provided, exiting...");

if (name.length === 0) abort("No name provided, exiting...");

if (name.includes(" ")) abort("No spaces allowed, exiting...");

if (name === ".") self = true;
else packageName = name;

const pAuthor: string = await new Promise((resolve) => {
  readline.question(`${fgCyan}Author: ${fgGreen}`, resolve);
});
const author: string = pAuthor.trim();

if (!author) abort("No author provided, exiting...");

if (author.length === 0) abort("No author provided, exiting...");

if (author.includes(" ")) abort("No spaces allowed, exiting...");

console.log(`\n${fgMagenta}Creating project...${reset}`);

if (self) {
  console.log(
    `${fgYellow}Warning: You are creating a project in the current directory.${reset}`
  );

  const directory = await fs.opendir(path.resolve(process.cwd()));
  const entry = await directory.read();
  await directory.close();
  if (entry) {
    const pAnswer: string = await new Promise((resolve) => {
      readline.question(
        `${fgRed}The current directory is not empty, do you want to continue? This will remove everything from it! ${fgCyan}(y/N)${fgRed}: ${fgGreen}`,
        resolve
      );
    });
    const answer: string = pAnswer.trim();
    if (answer.toLowerCase() !== "y") abort("Exiting...");
    else {
      await emptyDir(path.resolve(process.cwd()));
    }
  }
} else
  try {
    await run(`cd ${name}`);
    const pIsDelete: string = await new Promise((resolve) => {
      readline.question(
        `${fgRed}Project already exists. Would you like to overwrite it? This will delete everything in it. ${fgCyan}(y/N)${fgRed}: ${fgGreen}`,
        resolve
      );
    });
    const isDelete: string = pIsDelete.trim();
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

for (const cmd of commands) {
  try {
    if (cmd !== "pkg") {
      if (cmd === "git init") await run(`git init ${name}`);
      else if (cmd === "git finish") {
        await run(`git -C ./${name}/ add .`);
        await run(`git -C ./${name}/ commit -m "first commit"`);
      } else {
        if (cmd.includes("yarn"))
          console.log(
            `${fgYellow}Installing dependencies using ${fgGreen}yarn${fgYellow}...${reset}\n`
          );
        if (cmd.includes("yarn --cwd") && self)
          await run(cmd.replace("--cwd .NAME. ", ""));
        else if (cmd.includes('"name": ".NAME."'))
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

console.log(
  `${fgGreen}Setup complete!\nNext step:${reset} \n\n- ${fgBlue}cd ${
    name + reset
  } = ${fgYellow}change directory${reset}\n\n${fgGreen}Available Scripts:${reset}\n\n- ${fgBlue}yarn dev${reset} = ${fgYellow}open up a dev server${reset}\n- ${fgBlue}yarn open${reset} = ${fgYellow}build & start${reset}\n- ${fgBlue}yarn build${reset} = ${fgYellow}builds the source files${reset}\n- ${fgBlue}yarn start${reset} = ${fgYellow}start up a server${reset}\n- ${fgBlue}yarn compile${reset} = ${fgYellow}compile TypeScript${reset}\n- ${fgBlue}yarn lint${reset} = ${fgYellow}check for warnings${reset}\n- ${fgBlue}yarn format${reset} = ${fgYellow}prettifies the source files${reset}\n`
);

readline.close();
process.exit(0);
