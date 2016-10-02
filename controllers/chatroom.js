module.exports = function(app, sessionHandler){
    /***********************************
     * WEBSOCKET SERVER - Chatroom
     *   Chatroom websocket server
     ************************************/
    var chatClients = []
    app.ws("/chat", function(ws, req) {
        var request = ws.upgradeReq;
        var response = {writeHead: {}}; //What?
        //Make sure user is logged in.  Close websocket if not
        sessionHandler(request, response, function(err){
            if(!request.session.passport.user){
                ws.send("Invalid session");
                ws.close();
                return;
            }
            console.log("Client connected");
            var index = chatClients.push(ws) - 1;
            
            
            //When message received, broadcast that message to all clients
            ws.on('message', (msg)=>{
                let resmsg = JSON.stringify({
                    type: "message",
                    message: msg,
                    client: request.user.name()
                });
                chatClients.forEach(function(client){
                    client.send(resmsg);
                });
            });
            //When user disconnects, let all clients know
            ws.on('close', ()=>{
                chatClients.splice(index, 1);
                let resmsg = JSON.stringify({
                    type: "disconnect",
                    message: `User disconnected: ${request.user.name()}`,
                    client: request.user.name()
                });
                chatClients.forEach((client)=>{
                    client.send(resmsg);
                });
                console.log("Client disconnected");
            });

            let joinmsg = JSON.stringify({
                type: "connect",
                message: `User connected: ${request.user.name()}`,
                client: request.user.name()
            });
            //When new user connects, let all clients know
            //Also - get list of all current clients
            let clients = [];
            chatClients.forEach((client)=>{
                client.send(joinmsg);
                clients.push(client.upgradeReq.user.name());
            });

            let clientsmsg = JSON.stringify({
                type: "users",
                clients: clients
            })
            //Send list of all current clients to recently connected user
            ws.send(clientsmsg)
        });
    });
}