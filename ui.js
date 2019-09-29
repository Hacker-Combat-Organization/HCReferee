/*
Copyright 2016-Present Hacker Combat Authors
This file is part of the Hacker Combat library.
The Hacker Combat Protocol is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
The Hacker Combat Protocol is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License
along with the Hacker Combat Protocol library. If not, see <http://www.gnu.org/licenses/>.
*/

var tty = require('tty.js');
var mqtt = require('mqtt')

process.argv.forEach(function (val, index, array) {
  console.log("ARGS: "+index + ': ' + val);
});
var client  = mqtt.connect('mqtt://'+process.argv[2]+':1883')
var ips = new Map()
var players = new Map()
var flags = new Map()
var flagsMap = new Map()
var capturedFlags = new Map()


var Analytics  = {
  init: function(obj){
    console.log(obj)
    console.log(Analytics.enterPerMin(obj.x))
    console.log(Analytics.deletePerMin(obj.y))
  },
  enterPerMin: function(entersPressed){
    return entersPressed*6;
  },
  deletePerMin: function(deletesPressed){
    return deletesPressed*6;
  }
}

var latestAnalytics = {}

var app = tty.createServer({
  "users": {
    "admin": "password"
  },
  "port": 8082,
  "hostname": process.argv[2],
  "shell": "bash",
  "static": "./static",
  "limitGlobal": 10000,
  "limitPerUser": 1000,
  "localOnly": false,
  "cwd": ".",
  "syncSession": false,
  "sessionTimeout": 600000,
  "log": true,
  "io": { "log": false },
  "debug": false,
  "term": {
    "termName": "xterm",
    "geometry": [80, 24],
    "scrollback": 1000,
    "visualBell": false,
    "popOnBell": false,
    "cursorBlink": false,
    "screenKeys": false,
    "colors": [
      "#2e3436",
      "#cc0000",
      "#4e9a06",
      "#c4a000",
      "#3465a4",
      "#75507b",
      "#06989a",
      "#d3d7cf",
      "#555753",
      "#ef2929",
      "#8ae234",
      "#fce94f",
      "#729fcf",
      "#ad7fa8",
      "#34e2e2",
      "#eeeeec"
    ]
  }
}
);

var obj;

app.get('/hello', function(req, res, next) {
  res.send('world');
});

client.on('connect', function () {
 client.subscribe('player 1')
})

client.on('message', function (topic, message) {
 players.set(JSON.parse( message.toString() ).playerName,message.toString())
 obj = players.get(JSON.parse( message.toString() ).playerName)
 latestAnalytics = obj
 console.log(obj)
 //client.end()
})


process.title = 'node-chat';
var webSocketsServerPort = 1338;
var webSocketServer = require('websocket').server;
var http = require('http');

var history = [ ];
var clients = [ ];

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
colors.sort(function(a,b) { return Math.random() > 0.5; } );

var server = http.createServer(function(request, response) {
    // Not important 
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});


var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;
    console.log((new Date()) + ' Connection accepted.');
    setInterval((function(){

      // players.forEach((function(key,item){
      //   //console.log(key + item)
      //   connection.sendUTF(JSON.stringify( {key: item} ));
      // }))

      console.log(players.keys())
      var playerKeys = players.keys()
      var dataSetHolder = []
      for(var pk = 0; pk < playerKeys.length; pk++){
        dataSetHolder.push(players.get(playerKeys[pk]))
      }

      //Analytics.init(obj.parameter);
      //console.log(obj)

      try{
        console.log(obj)
        console.log(latestAnalytics)
        // var analyticsData = {"x": Analytics.init(obj.parameter.x),
        //                      "y": Analytics.init(obj.parameter.y)
        //                    }

         var analyticsData = {
            "playerName": latestAnalytics.playerName,
            "x": Analytics.enterPerMin(latestAnalytics.parameter.x),
            "y": Analytics.deletePerMin(latestAnalytics.parameter.y),
            "z": Analytics.deletePerMin(latestAnalytics.parameter.z)
          }

      }catch(e){

        console.log("ERROR ==="+e)

        obj = {}
        analyticsData = {}
      }

      connection.sendUTF(JSON.stringify( {key: dataSetHolder, analytics: analyticsData} ));

    }),1000)

    connection.on('message', function(message) {
      console.log(message.type)
        if (message.type === 'utf8') { 

                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);

                try{
                  var pl = JSON.parse(message.utf8Data)
                  var analyticsPayload  = {
                    "playerName": pl.playerName,
                    "opponentName": "jovi",
                    "state": "analytics",
                    "parameter": {
                        "x": pl.x,
                        "y": pl.y,
                        "z": pl.z
                    }
                  }
                  console.log(pl)
                  client.publish("Analytic", JSON.stringify(analyticsPayload) )
                }catch(e){
                  console.log(e);
                }
                //clients[i].sendUTF(json);
        }
    });

    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer 1"
                + connection.remoteAddress + " disconnected.");
            clients.splice(index, 1);
            colors.push(userColor);
        }
    });
});

app.listen();

var analyticsPayloadInit  = {
  "playerName": "player 1",
  "opponentName": "player 2",
  "state": "analytics",
  "parameter": {
      "x": "0",
      "y": "0",
      "z": "0"
  }
}

client.publish("Analytic", JSON.stringify(analyticsPayloadInit) )
