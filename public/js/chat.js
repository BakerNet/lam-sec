//types of message/action from websocket server
var actions = {
    message: "message",
    disconnect: "disconnect",
    connect: "connect",
    users: "users"
}
//get chatbox node
var messages = document.getElementById('messages');
//get userlist node
var userlist = document.getElementById('user-list');
//get send message button
var sendButton = document.getElementById('send-button');

//connect to websocket on server
var ws = new WebSocket("ws://localhost:3000/chat");
ws.onopen = function(event) {
    //ws.send("testing");
    /**********************
     * If send button clicked, (or enter pressed - see add event listener below),
     *    Send message to server and clear message box
     *********************/   
    sendButton.onclick = function(){

        let messageText = document.getElementById('message-input-body').value;
        ws.send(messageText);
        document.getElementById('message-input-body').value = "";
    }
}
/**********************
 * Process message from server
 *********************/ 
ws.onmessage = function(event){
    let eventdata = JSON.parse(event.data);
    //console.log(JSON.stringify(eventdata));
    switch(eventdata.type){
        case "message":
            addMessage(eventdata);
            break;
        case "connect":
            addUser(eventdata.client);
            connectMessage(eventdata.client);
            break;
        case "disconnect":
            removeUser(eventdata.client);
            disconnectMessage(eventdata.client);
            break;
        case "users":
            eventdata.clients.forEach(function(client){
                addUser(client);
            });
            break;
        default:
            conosole.log(`Error - message type: ${event.type}`);
            break;
    }
}

var forms = document.querySelector("form");
/**********************
 * Prevent HTTP submit for forms on page - prevents enter from causing submit
 *********************/ 
forms.addEventListener("submit", function(event) {
  event.preventDefault();
  // actual logic, e.g. validate the form
});

/**********************
 * Add user to user list
 *********************/ 
function addUser(user){
    if(document.getElementById(`user-${user}`) === null){
        //console.log(document.getElementById(`user-${user}`));
        let utpl = document.getElementById('user-template').content.cloneNode(true);
        utpl.querySelector('li').id = `user-${user}`;
        utpl.getElementById('user-displayname').innerHTML = user;
        utpl.getElementById('user-status').innerHTML = "online";
        userlist.appendChild(utpl);
    }
    
}
/**********************
 * Remove user from user list
 *********************/ 
function removeUser(user){
    let dcuser = document.getElementById(`user-${user}`);
    userlist.removeChild(dcuser);
}
/**********************
 * Write message from server to chatbox
 *********************/ 
function addMessage(message){
    let date = new Date();
    let mtpl = document.getElementById('message-template').content.cloneNode(true);
    mtpl.getElementById('message-body').innerHTML = message.message;
    mtpl.getElementById('message-user').innerHTML = `${message.client} | ${date.toString()}`;
    messages.appendChild(mtpl);
    //Scroll down on overflow
    messages.scrollTop = messages.scrollHeight;
}

function connectMessage(user){
    let mtpl = document.getElementById('conn-message-template').content.cloneNode(true);
    mtpl.getElementById('message-body').innerHTML = `${user} connected`;
    messages.appendChild(mtpl);
    //Scroll down on overflow
    messages.scrollTop = messages.scrollHeight;
}

function disconnectMessage(user){
    let mtpl = document.getElementById('conn-message-template').content.cloneNode(true);
    mtpl.getElementById('message-body').innerHTML = `${user} disconnected`;
    messages.appendChild(mtpl);
    //Scroll down on overflow
    messages.scrollTop = messages.scrollHeight;
}
