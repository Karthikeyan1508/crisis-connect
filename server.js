const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const admin = require('firebase-admin');
const express = require('express')

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


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
  const pathname = `./public${parsedUrl.pathname}`;

  // Handle requests for static files
  if (parsedUrl.pathname === '/' || parsedUrl.pathname.endsWith('.html')) {
    serveFile(path.join(__dirname, 'public', 'index.html'), 'text/html', res);
  } else if (parsedUrl.pathname.endsWith('.js')) {
    serveFile(pathname, 'application/javascript', res);
  } else if (parsedUrl.pathname.endsWith('.css')) {
    serveFile(pathname, 'text/css', res);
  } else if (parsedUrl.pathname.endsWith('.jpg')) {
    serveFile(pathname, 'image/jpeg', res);
  } else if (parsedUrl.pathname === '/protected' && req.method === 'POST') {
    // Handle protected route
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const idToken = req.headers.authorization;
      if (!idToken) {
        res.writeHead(401);
        res.end('Unauthorized: No token provided');
        return;
      }

      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const uid = decodedToken.uid;
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(`This is a protected route. Hello user ${uid}`);
        })
        .catch((error) => {
          res.writeHead(401);
          res.end('Unauthorized: Invalid token');
        });
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
