'use strict';

const http = require('http');
const WSServer = require('socket.io');
const WSAuth = require('socketio-auth');
const graphql = require('graphql');
const dataJSON=require('./data.json');

const config = require('./config');


//==================================   LAB 5 ===========================================================================

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(` Server ready at ${url}`);
});


//======================================================================================================================

const httpServer = http.createServer( errorOnView );
const io = new WSServer( httpServer );

const auth = new WSAuth( io, {
  authenticate: onAuthenticate,
  postAuthenticate: onAuthenticated,
  disconnect: onDisconnected,
  timeout: 1000000  // TODO for some reason it fails to connect without this. need to investigate further
} );

const sockets = {};

// TODO dummy initial data
const items = [
  { id: 1, name: "Petr I", year: "1677"  },
  { id: 2, name: "Petr II", year: "1720" },
];

httpServer.listen( config.port, function onListenStarted() {
  console.log("Server started");
} );

io.on( 'connection', (socket) => {
  console.log("Connected");

  socket.on( 'disconnecting', (reason) => {
    console.log("Disconnecting: " + reason);
    cleanupClientSocketData( socket );
  } );
  socket.on( 'disconnect', (reason) => {
    console.log("Disconnect: " + reason);
  } );
  socket.on( 'error', (err) => {
    console.log("Error: " + err);
  } );

  socket.on( 'cmd', cmd => onCommand( socket, cmd ) );
} );

function cleanupClientSocketData( socket ) {
  if( sockets[socket.id] ) {
    clearInterval( sockets[socket.id].timerID );
    delete sockets[socket.id];
  }
}

function errorOnView( req, res ) {
  res.writeHead(500);
  res.end("Not viewable");
}

function onAuthenticate( socket, data, cb ) {
  console.log("On auth");
  const loginInfo = JSON.parse(data);
  // TODO proper verify logic from db etc
  const authPassed = loginInfo.userName === config.userName && loginInfo.password === config.password;
  cb( null, authPassed );
}

function onAuthenticated( socket, data ) {
  // from this point, can start sending msg to client
  console.log("Authenticated");

  // for test purpose, send some heartbeat events to client
  const timerID = setInterval( () => socket.emit('event', { type: 'hb', data: Date.now() } ), config.heartbeatMS );

  sockets[socket.id] = { timerID: timerID };
}

function onDisconnected( socket ) {
  console.log("Disconnected");
}

function onCommand( socket, cmd ) {
  console.log( 'cmd:' + cmd.type );

  switch( cmd.type ) {
    // snapshot sending to specific client on request
    case 'snap':
      items.forEach( i =>
        socket.emit( 'event', { type: 'emperoradded', data: i } )
      );
      break;
    // data changes are broadcast for all clients
    case 'addemperor':
      items.push( cmd.data );
      io.emit( 'event', { type: 'emperoradded', data: cmd.data } );
      break;
    case 'updateemperor':
      const item = items.find( i => i.id === cmd.data.id );
      item.name = cmd.data.name;
      item.year = cmd.data.year;
      io.emit( 'event', { type: 'emperorupdated', data: item } );
      break;
    case 'delemperor':
      const idx = items.findIndex( i => i.id === cmd.data.id );
      items.splice( idx, 1 );
      io.emit( 'event', { type: 'emperordeleted', data: cmd.data.id } );
      break;
  }
}


