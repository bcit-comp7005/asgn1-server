const fs = require('fs');
const path = require('path');

const { getClientIP } = require('./serverHelpers');

/**
 * Validate the directory exists (including IP). Create if not exists
 *
 * @param {String} dir
 * @returns
 */
const validateDir = (dir) => {
  try {
    fs.accessSync(dir, fs.constants.W_OK);
  } catch (accessError) {
    fs.mkdirSync(dir, { recursive: true }, (mkdirError) => {
      console.error(`Error creating dir: ${dir}; ${mkdirError}`);
      process.exit(9);
    });
    console.log(`Created ${dir}`);
  }
  return dir;
};

/**
 * List the directory content
 *
 * @param {String} dir
 * @returns
 */
const listDirectory = (dir) => (
  fs.readdirSync(dir)
);

/**
 * Append a string to the end of a filename
 *
 * @param {String} filename
 * @param {String} string
 * @returns
 */
const appendToFilename = (filename, string) => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return filename + string;
  }
  return filename.substring(0, lastDotIndex) + string + filename.substring(lastDotIndex);
};

/**
 * Moves the file from the temp directory to the intended storage area.
 * Updated the file version if it already exists
 *
 * @param {PersistentFile} file
 * @param {String} dir
 * @param {String[]} dirContent
 * @returns
 */
const storeFile = (file, dir, dirContent) => {
  let filename = file.originalFilename;
  let version = 1;

  while (dirContent.includes(filename)) {
    filename = appendToFilename(file.originalFilename, `-v${version}`);
    // eslint-disable-next-line no-plusplus
    version++;
  }
  console.log(`storing file ${path.join(dir, filename)}`);
  fs.rename(
    file.filepath,
    path.join(dir, filename),
    (err) => {
      if (err) {
        console.error(`Error renaming file ${filename}; Error: ${err}`);
      }
    },
  );
  return filename;
};

const storeFiles = (req, res, dir, { multipleFiles: files }) => {
  const clientIP = getClientIP(req);
  const writeDir = path.join(dir, clientIP);
  const filesToStore = Array.isArray(files) ? files : [files];

  validateDir(writeDir);
  const currentFiles = listDirectory(writeDir);
  Promise.all(filesToStore.map((file) => storeFile(file, writeDir, currentFiles)))
    .then((storedFileNames) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(storedFileNames, null, 2));
    });
};

module.exports = {
  storeFiles,
};
