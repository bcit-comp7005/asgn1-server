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

const getServerPort = () => {
  const port = argv.p || defaultPort;
  // Check if the command line input has a port value and that it is actually a number
  if (argv.hasOwnProperty('p') && Number.isNaN(port)) {
    console.error(
      Array.isArray(port)
        ? 'Too many arguments for port.'
        : 'Invalid input for port.',
    );
    // Exit the program
    process.exit(9);
  }
  if (port < 1025) {
    console.error(`Port ${port} is within the reserved ports. Please enter a higher port`);
    process.exit(9);
  }
  return port;
};

const getUploadFilePath = (basePath) => {
  const fileDir = argv.d || path.join(basePath, defaultFileFolder);
  // Check if the command line input has a port value and that it is actually a number
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
  getUploadFilePath,
};
