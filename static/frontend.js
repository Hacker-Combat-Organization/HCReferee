$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    var terminalInput = $('div.terminal');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection http://54.147.154.3/
    var connection = new WebSocket('ws://'+$("#gip").val()+':1338');
    //var connection = new WebSocket('ws://54.147.154.3:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose Admin:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    var playerAnalyticsHashTable = {}
    var firstPlayerRecognized = "";
    connection.onmessage = function (message) {


            var json = JSON.parse(message.data);
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);

            var players = json.key






    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            //connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            //input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });








    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);



    $(function(){
     $(".terminal div").keypress(function (e) {
        if (e.keyCode == 13) {
            alert('You pressed enter!');
        }
     });
    });

    var numDelete = 0
    var numEnter = 0
    var numCharacter = 0

    $(document).on('keyup.terminal', ".terminal", function (e) {
      console.log('Handler for .keypress() called. - ');
      console.log(event.key);
      numCharacter++
      if(event.key == "Enter"){
        numEnter++
      }else if(event.key == "Backspace"){
        numDelete++
      }
      //console.log( $( ".terminal > div:nth-last-child(1)" ).html() )
    });

    setInterval(
      function(){
        connection.send(JSON.stringify({"playerName": $("#input").val(),"x": numEnter, "y": numDelete, "z": numCharacter}));
        numDelete = 0
        numEnter = 0
        numCharacter = 0
      }
      , 10000)



});
