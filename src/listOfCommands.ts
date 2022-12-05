export const commands: string[] = [
  "pkg",
  "echo '/node_modules\\n/dist' > ./.NAME./.gitignore",
  "echo '/node_modules\\n/dist' > ./.NAME./.dockerignore",
  "git init",
  "yarn --cwd ./.NAME. add -D @types/node husky eslint nodemon prettier ts-node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser",
  "prettier -w ./.NAME./",
  "husky",
  "git finish",
];
