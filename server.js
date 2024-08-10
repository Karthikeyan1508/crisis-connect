const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Helper function to serve files
function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// Create an HTTP server
http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = `./public${parsedUrl.pathname}`;
  
  // Default to serving index.html if the path is '/'
  if (parsedUrl.pathname === '/') {
    pathname = path.join(__dirname, 'public', 'index.html');
  } else if (parsedUrl.pathname === '/weather.html') {
    pathname = path.join(__dirname, 'public', 'weather.html');
  }else if (parsedUrl.pathname === '/volunteer.html') {
    pathname = path.join(__dirname, 'public', 'volunteer.html');
  }else if (parsedUrl.pathname === '/volList.html') {
    pathname = path.join(__dirname, 'public', 'volList.html');
  }else if (parsedUrl.pathname === '/tutorial.html') {
    pathname = path.join(__dirname, 'public', 'tutorial.html');
  }

  const extname = path.extname(pathname);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'application/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    default:
      contentType = 'text/html';
  }

  serveFile(pathname, contentType, res);
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
