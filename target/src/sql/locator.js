const fs = require('fs');
const path = require('path');

const locator = (dirname) => {
  const dirents = fs.readdirSync(
    dirname,
    { withFileTypes: true },
    (err, dirents) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
  const sqlFiles = [];
  for (const dirent of dirents) {
    const fileInfo = path.parse(dirent.name);
    if (dirent.isFile() && fileInfo.ext === '.sql') {
      sqlFiles[fileInfo.name] = fs.readFileSync(
        path.join(dirname, fileInfo.base),
        'utf8'
      );
    }
  }
  return sqlFiles;
};

exports.locator = locator;
