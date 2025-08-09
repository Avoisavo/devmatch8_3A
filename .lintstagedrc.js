const path = require("path");

// Use eslint directly to avoid `next lint` triggering SWC lockfile patching under Yarn 3
const buildNextEslintCommand = filenames =>
  `yarn workspace @se-2/nextjs eslint --fix --max-warnings=0 ${filenames
    .map(f => path.relative(path.join("packages", "nextjs"), f))
    .join(" ")}`;

const checkTypesNextCommand = () => "yarn next:check-types";

const buildHardhatEslintCommand = filenames =>
  `yarn hardhat:lint-staged --fix ${filenames
    .map(f => path.relative(path.join("packages", "hardhat"), f))
    .join(" ")}`;

module.exports = {
  "packages/nextjs/**/*.{ts,tsx}": [buildNextEslintCommand, checkTypesNextCommand],
  "packages/hardhat/**/*.{ts,tsx}": [buildHardhatEslintCommand],
};
