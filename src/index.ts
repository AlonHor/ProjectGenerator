import { exec } from "child_process";
import { promises } from "node:fs";
import path from "node:path";
import { createInterface } from "readline";
import { commands } from "./listOfCommands.js";

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Promise<unknown>} { stdout: String, stderr: String }
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

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fgGreen = "\x1b[32m";
const fgCyan = "\x1b[36m";
const fgYellow = "\x1b[33m";
const fgRed = "\x1b[31m";
const fgBlue = "\x1b[34m";
const fgMagenta = "\x1b[35m";

const reset = "\x1b[0m";

let self = false;
let name = "";
let packageName = "";

async function main() {
  packageName = path.basename(path.resolve(process.cwd()));

  if (process.argv[2]) name = process.argv[2][0];
  else {
    name = (
      (await new Promise((resolve) => {
        readline.question(`${fgCyan}Project Name: ${fgGreen}`, resolve);
      })) as string
    ).trim();
  }

  if (!name) {
    console.log(`${fgRed}No name provided, exiting...${reset}`);
    process.exit(0);
  }

  if (name.length === 0) {
    console.log(`${fgRed}No name provided, exiting...${reset}`);
    process.exit(0);
  }

  if (name.includes(" ")) {
    console.log(`${fgRed}No spaces allowed, exiting...${reset}`);
    process.exit(0);
  }

  if (name === ".") self = true;
  else packageName = name;

  const author: string = (
    (await new Promise((resolve) => {
      readline.question(`${fgCyan}Author: ${fgGreen}`, resolve);
    })) as string
  ).trim();

  if (!author) {
    console.log(`${fgRed}No name provided, exiting...${reset}`);
    process.exit(0);
  }

  if (author.length === 0) {
    console.log(`${fgRed}No name provided, exiting...${reset}`);
    process.exit(0);
  }

  if (author.includes(" ")) {
    console.log(`${fgRed}No spaces allowed, exiting...${reset}`);
    process.exit(0);
  }

  console.log(`\n${fgMagenta}Creating project...${reset}`);

  if (self) {
    console.log(
      `${fgYellow}Warning: You are creating a project in the current directory.${reset}`
    );

    const directory = await promises.opendir(path.resolve(process.cwd()));
    const entry = await directory.read();
    await directory.close();
    if (entry) {
      const answer = (
        (await new Promise((resolve) => {
          readline.question(
            `${fgRed}The current directory is not empty, do you want to continue? ${fgCyan}(y/N)${fgRed}: ${fgGreen}`,
            resolve
          );
        })) as string
      ).trim();
      if (answer.toLowerCase() !== "y") {
        console.log(`${fgRed}Exiting...${reset}`);
        process.exit(0);
      } else {
        await run("rm -rf *");
        await run("rm -rf .git");
        await run("rm -rf .gitignore");
      }
    }
  } else
    try {
      await run(`cd ${name}`);
      const isDelete: string = (
        (await new Promise((resolve) => {
          readline.question(
            `${fgRed}Project already exists. Would you like to overwrite it? This will delete everything in it. ${fgCyan}(y/N)${fgRed}: ${fgGreen}`,
            resolve
          );
        })) as string
      ).trim();
      if (isDelete.toLowerCase() === "y") await run(`rm -rf ${name}`);
      else {
        console.log(`${fgRed}Exiting...${reset}`);
        process.exit(0);
      }
    } catch (e) {
      console.log(`${fgGreen}Project does not exist, continuing...${reset}`);
    }

  console.log(
    `${fgYellow}Installing dependencies using ${fgGreen}yarn${fgYellow}...${reset}\n`
  );

  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  if (!self) await run(`mkdir ${packageName}`);
  await run(
    `cp -r ${__dirname}/../template/* ${
      self ? `../${packageName}` : packageName
    }`
  );

  for (const cmd of commands) {
    try {
      if (cmd !== "pkg") {
        if (cmd === "git init") await run(`git init ${name}`);
        else if (cmd === "git finish") {
          await run(`git -C ./${name}/ add .`);
          await run(`git -C ./${name}/ commit -m "first commit"`);
        } else {
          if (cmd.includes("yarn --cwd") && self)
            await run(cmd.replace("--cwd .NAME. ", ""));
          else if (cmd.includes('"name": ".NAME."'))
            await run(
              cmd
                .replace(
                  /\.NAME\./g,
                  path.basename(path.resolve(process.cwd()))
                )
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
      console.log(fgRed + e + reset);
      process.exit(1);
    }
  }

  console.log(
    `${fgGreen}Setup complete!\nNext step:${reset} \n\n- ${fgBlue}cd ${
      name + reset
    } = ${fgYellow}change directory${reset}\n\n${fgGreen}Available Scripts:${reset}\n\n- ${fgBlue}yarn dev${reset} = ${fgYellow}open up a dev server${reset}\n- ${fgBlue}yarn open${reset} = ${fgYellow}build & start${reset}\n- ${fgBlue}yarn build${reset} = ${fgYellow}builds the source files${reset}\n- ${fgBlue}yarn start${reset} = ${fgYellow}start up a server${reset}\n- ${fgBlue}yarn compile${reset} = ${fgYellow}compile TypeScript${reset}\n- ${fgBlue}yarn lint${reset} = ${fgYellow}check for warnings${reset}\n- ${fgBlue}yarn format${reset} = ${fgYellow}prettifies the source files${reset}\n`
  );

  readline.close();
}

main();
