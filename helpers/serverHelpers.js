const fs = require('fs');

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

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
  // eslint-disable-next-line no-restricted-globals
  if (argv.hasOwnProperty('p') && (isNaN(port) || port === true)) {
    console.error(
      port === true
        ? 'Invalid argument for port.'
        : 'Please enter a value for the port flag.',
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

/**
 * Gets the IP address of the request
 * Checks if the IP address is behind a proxy and gets the origin. Otherwise, returns the
 * IP address from the request. Localhost requests using IPv6 returns 'localhost'
 *
 * @param {*} req request
 * @returns IP Address
 */
const getClientIP = (req) => {
  const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
  return (!(ip === '::1' || ip === '::ffff:127.0.0.1') ? ip : 'localhost');
};

module.exports = {
  getClientIP,
  getServerPort,
  getUploadedFilePath,
};
