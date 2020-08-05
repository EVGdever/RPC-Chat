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

let clients = [];

ws.on('request', req => {
    const connection = req.accept('', req.origin);
    clients.push(connection);
    console.log(`Connected ${connection.remoteAddress}`);

    connection.on('message', rpcRequest => {
        const data = getDataFromRpc(rpcRequest);

        switch (data.method) {
            case 'firstNumber':
                connection.firstNumber = data.params.firstNumber;
                connection.sumNumber = Math.floor(Math.random() * Math.floor(10000));

                data.method = 'controlServer';
                data.params.controlServer = (connection.sumNumber + connection.firstNumber) % 256;
                connection.send(JSON.stringify(data));
                break;
            case 'controlClient':
                clients = clients.map(client => {
                    if (connection === client) {
                        client.appId = data.params.appId;
                        client.key = (connection.sumNumber + data.params.controlClient) % 256;
                    }
                    return client;
                })
                break;
            case 'message':
                const client = clients.filter(c => c.appId === data.params.appId)[0];
                console.log(client);
                const message = encryptedToString(
                    data.params.message,
                    client.key
                );
                clients.forEach(client => {
                    if (connection !== client) {
                        data.params.message = stringToEncrypted(message, client.key);
                        client.send(JSON.stringify(data));
                    }
                })
                break;
            default:
                console.log('Данный метод не обрабатывается!');
        }
    });

    connection.on('close', (reasonCode, description) => {
        console.log(`Disconnected ${connection.remoteAddress}`);
        console.dir({reasonCode, description});
        clients = clients.filter(client => !client.closeEventEmitted && client.appId);
    });
});

function getDataFromRpc(rpc) {
    const dataName = rpc.type + 'Data';
    const data = rpc[dataName];
    return JSON.parse(data);
}

function stringToEncrypted(str, key) {
    const strArray = str.split('');
    return strArray
        .map(value => value.charCodeAt(0) * key)
        .join('-');
}

function encryptedToString(encrypted, key) {
    return encrypted
        .split('-')
        .map(value => String.fromCharCode(value / key))
        .join('')
}
