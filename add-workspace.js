const { writeFile } = require("fs/promises");
const { argv, exit } = require("process");

const packageFilename = "./package.json";
const file = require(packageFilename);

const name = argv[2];
if (!name) {
  console.error("Missing name of new mini!");
  exit(1);
}

const workspaces = file.workspaces;
if (!workspaces.includes(name)) {
  workspaces.push(name);
  workspaces.sort();
}
const data = JSON.stringify(file, null, 2);
writeFile(packageFilename, data);
