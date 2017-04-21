const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 5000;
const crypto = require("crypto");

server.listen(port, function () {
    console.log("Listening on port %d", port);
});
app.use(express.static(__dirname + "/public"));

// mock database
const data = { 
    branches: {
        "root": {
            parentId: "root",
            branchId: "root",
            topic: "root",
            messages: [],
            users: []
        }
    }
}

const ROOT_BRANCH = "root"

function genId() {
    return crypto.randomBytes(48).toString("hex");
}

function genUniqueId(obj) {
    let id;
    do {
        id = genId();
    }
    while (id in obj);
    return id;
}

function getBranch(branchId) {
    return data.branches[branchId];
}

function getMessage(branchId, messageId) {
     return getBranch(branchId).messages.find(message => message.id === messageId);
}

io.on("connection", function (socket) {
    socket.on("INIT", (username) => {
        onInitUser(socket, username);
    });
    socket.on("SEND_MSG", onUserMessage);
    socket.on("JOIN_BRANCH", (branchedData) => {
        onUserJoinBranch(socket, branchedData);
    });
    socket.on("disconnect", () => {
        removeUserFromAllBranches(socket);
    });
});

function onInitUser(socket, username) {
    if (!socket.username) {
        socket.username = username;
        socket.branchesJoined = [ROOT_BRANCH];
        const userData = { id: socket.id, username: socket.username };
        data.branches[ROOT_BRANCH].users.push(userData);
        socket.join(ROOT_BRANCH);
        socket.broadcast.to(ROOT_BRANCH).emit("RECV_USER", { id: socket.id, username: socket.username, branchId: ROOT_BRANCH});
        socket.emit("RECV_BRANCH", getBranch(ROOT_BRANCH));
    }
}

function onUserMessage({ branchId, username, messageContent }) {
    const messageId = genUniqueId(data.branches[branchId].messages);
    const message = { branchId, id: messageId, username, messageContent, alert: "", branchedId: "" };
    data.branches[branchId].messages.push(message);
    io.in(branchId).emit("RECV_MSG", message);
}

function createBranch(messageContent, parentId) {
    const branchId = genUniqueId(data.branches);
    data.branches[branchId] = {
        parentId,
        branchId,
        topic: messageContent,
        messages: [],
        users: []
    }
    return branchId;
}

function branchMessage(branchId, messageId, branchedId) {
    const toBranch = getMessage(branchId, messageId);
    toBranch.branchedId = branchedId;
    toBranch.alert = "This message has branched!";
}

function addUserToBranch(socket, branchId) {
    if (socket.branchesJoined.indexOf(branchId) === -1) {
        socket.branchesJoined.push(branchId);
        const userData = { id: socket.id, username: socket.username, branchId };
        socket.join(branchId);
        data.branches[branchId].users.push(userData);
        socket.broadcast.to(branchId).emit("RECV_USER", userData);
        return true;
    }
    return false;
}

function onUserJoinBranch(socket, branchedData) {
    let { branchId, id, branchedId, messageContent } = branchedData; 
    if (!branchedId) {
        branchedId = createBranch(messageContent, branchId);
        branchMessage(branchId, id, branchedId);
        io.in(branchId).emit("MOD_MSG", getMessage(branchId, id));
    }
    if (addUserToBranch(socket, branchedId)) {
        socket.emit("RECV_BRANCH", getBranch(branchedId));
    }
}

function removeUserFromBranch(socket, branchId) {
    const branch = getBranch(branchId);
    const userIndexInBranch = branch.users.findIndex((user) => user.username === socket.username);
    branch.users.splice(userIndexInBranch, 1);
    socket.broadcast.to(branchId).emit("UPDATE_USERS", { branchId, users: branch.users });
}

function removeUserFromAllBranches(socket) {
    if (socket.branchesJoined) {
        for (let i = 0; i < socket.branchesJoined.length; ++i) {
            removeUserFromBranch(socket, socket.branchesJoined[i]);
        }
    }
}