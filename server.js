const fs = require('fs');
const http = require('http');
const WebSocket = require('websocket').server;

const index = fs.readFileSync('./index.html', 'utf-8');
const server = http.createServer((req, res) => {
   res.writeHead(200);
   res.end(index);
});

const port = 8080;
server.listen(port, () => {
    console.log(`Server start on ${port}`);
});

const ws = new WebSocket({
    httpServer: server,
    autoAcceptConnections: false
});

const clients = [];

ws.on('request', req => {
    const connection = req.accept('', req.origin);
    clients.push(connection);
    console.log(`Connected ${connection.remoteAddress}`);

    connection.on('message', message => {
       const dataName = message.type + 'Data';
       const data = message[dataName];
       console.dir(message);
       console.log('Received: ', data);
       clients.forEach(client => {
           if(connection !== client) {
               client.send(data);
           }
       });
    });

    connection.on('close', (reasonCode, description) => {
        console.log(`Disconnected ${connection.remoteAddress}`);
        console.dir({reasonCode, description});
    });
});
