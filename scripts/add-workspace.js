const { argv, exit } = require("process");
const { updatePackageData } = require("./utils");

const name = argv[2];
if (!name) {
  console.error("Missing name of new mini!");
  exit(1);
}

updatePackageData((data) => {
  const workspaces = data.workspaces;
    if (!workspaces.includes(name)) {
      workspaces.push(name);
      workspaces.sort();
    }
    return data;
});