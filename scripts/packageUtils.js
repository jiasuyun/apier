const fs = require("fs");
const path = require("path");

const PACKAGES_DIR = path.resolve(__dirname, "../packages");

// Get absolute paths of all directories under packages
function getPackages() {
  let pkgNames = fs.readdirSync(PACKAGES_DIR);
  return resolvePackages(pkgNames);
}

function resolvePackages(pkgNames) {
  return pkgNames.map(resolvePackage).filter(isDirectory);
}

function resolvePackage(name) {
  return path.resolve(PACKAGES_DIR, name);
}

function isDirectory(file) {
  return fs.lstatSync(path.resolve(file)).isDirectory();
}

exports.getPackages = getPackages;
exports.resolvePackages = resolvePackages;
exports.resolvePackage = resolvePackage;
