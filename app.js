const http = require('http');
const path = require('path');
const formidable = require('formidable');

const { getClientIP, getServerPort, getUploadedFilePath } = require('./helpers/serverHelpers');
const { listDirectory, storeFiles } = require('./helpers/fileHelpers');

const port = getServerPort();
const fileUploadPath = getUploadedFilePath(__dirname);

http.createServer((req, res) => {
  if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    // Parse a file upload
    const form = formidable({ multiples: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
        res.end(String(err));
        return;
      }
      storeFiles(res, fileUploadPath, req.socket.remoteAddress, files);
    });
  } else {
    const clientIP = getClientIP(req);
    const writeDir = path.join(fileUploadPath, clientIP);
    const currentFiles = listDirectory(writeDir);
    const currentFileString = currentFiles.length > 0
      ? `<li>${currentFiles.join('</li><li>')}</li>`
      : 'No files found';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
    <!DOCTYPE html>
    <html>
       <head>
          <title>Files</title>
       </head>
       <body>
          <p>The following are the files you have uploaded:</p>
          <dir>
             ${currentFileString}
          </dir>
       </body>
    </html>
    `);
  }
}).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
