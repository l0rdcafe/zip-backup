#!/usr/bin/env node

const fs = require("fs");
const AdmZip = require("adm-zip");
const chalk = require("chalk");

const zip = new AdmZip();

function readDirContents(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, contents) => {
      if (err) {
        reject(err);
      }
      resolve(contents);
    });
  });
}

async function getDirContents(dir) {
  try {
    const contents = await readDirContents(dir);
    const files = [];

    for (const item of contents) {
      const path = `./${dir}/${item}`;
      const stats = fs.lstatSync(path);

      if (stats.isFile()) {
        files.push({ path });
      } else {
        const subDirs = await getDirContents(path);
        files.push(...subDirs);
      }
    }
    return files;
  } catch (e) {
    throw e;
  }
}

function compressFile(file) {
  zip.addLocalFile(file);
  zip.writeZip("backup.zip");
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Please provide a directory path to backup as zip file.");
    process.exit(1);
  } else {
    try {
      const dir = process.argv[2];
      const files = await getDirContents(dir);
      files.forEach(file => {
        compressFile(file.path);
        console.log(`${chalk.green(file.path)} was compressed.`);
      });
      console.log(`All files in ${chalk.cyan(dir)} directory were zipped to backup.zip.`);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
}

main();
