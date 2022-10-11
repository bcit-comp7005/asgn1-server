const fs = require('fs');

const path = require('path');
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    dir: 'd',
    port: 'p',
  },
});

const defaultPort = 3000;
const defaultFileFolder = 'uploads';

/**
 * Read CLI and return the port number to use or error
 *
 * @returns
 */
const getServerPort = () => {
  const port = argv.p || defaultPort;
  // Check if the command line input has a port value and that it is actually a number
  if (argv.hasOwnProperty('p') && Number.isNaN(port)) {
    console.error(
      Array.isArray(port)
        ? 'Too many arguments for port.'
        : 'Invalid argument for port.',
    );
    // Exit the program
    process.exit(9);
  }
  return port;
};

/**
 * Read CLI and return base path for file uploads or error
 *
 * @param {String} basePath
 * @returns
 */
const getUploadedFilePath = (basePath) => {
  const fileDir = argv.d || path.join(basePath, defaultFileFolder);
  // Check if the command line input has a directory value and that it is valid
  if (argv.hasOwnProperty('d') && !(typeof fileDir === 'string')) {
    console.log('Invalid dir argument');
    process.exit(9);
  }

  // Try to access folder to upload files. If it does not exist, try to create it.
  try {
    fs.accessSync(fileDir, fs.constants.W_OK);
    console.log(`${fileDir} is writable`);
  } catch (accessError) {
    console.log(`${fileDir} is not writable`);
    fs.mkdirSync(fileDir, { recursive: true }, (mkdirError) => {
      console.error(`Error creating dir: ${fileDir}; ${mkdirError}`);
      process.exit(9);
    });
    console.log(`Created ${fileDir}`);
  }

  return fileDir;
};

module.exports = {
  getServerPort,
  getUploadedFilePath,
};
