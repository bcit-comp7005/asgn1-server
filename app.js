const http = require('http');

const formidable = require('formidable');
const { getServerPort, getUploadedFilePath } = require('./helpers/serverHelpers');
const { storeFiles } = require('./helpers/fileHelpers');

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
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form action="/upload" enctype="multipart/form-data" method="post">
        <div>Text field title: <input type="text" name="title" /></div>
        <div>File: <input type="file" name="files" multiple="multiple" /></div>
        <input type="submit" value="Upload" />
      </form>
    `);
  }
}).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
