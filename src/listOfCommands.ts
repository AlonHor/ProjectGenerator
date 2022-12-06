export const commands: string[] = [
  "pkg",
  "echo '/node_modules\\n/dist\\n/.idea\\n/.fleet' > ./.NAME./.gitignore",
  "git init",
  "yarn --cwd ./.NAME. add -D @types/node husky eslint nodemon prettier ts-node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser",
  "prettier -w ./.NAME./",
  "git finish",
];
