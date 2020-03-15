const http = require('http');
const app = require ('./app');

const port = process.env.PORT || 4000;
const d = new Date().toLocaleTimeString()
console.log(d)

const server = http.createServer(app);

server.listen(port);