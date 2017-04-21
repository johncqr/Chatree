import React from "react";
import ReactDOM from "react-dom";

// for scss transpiling into bundle.css
import style from "../styles/main.scss"

import IntroPage from "./components/IntroPage";
import MainPage from "./components/MainPage";

let socket = io();

class AppBase extends React.Component {
    constructor() {
        super();
        this.parentMap = {};
        this.rootId;
        this.state = {
            name: "",
            branches: [],
            tree: { children: {} },
            currentBranchId: ""
        }
    }

    componentDidMount() {
        socket.on("RECV_MSG", this.recieveMessage.bind(this));
        socket.on("RECV_BRANCH", this.recieveBranch.bind(this));
        socket.on("RECV_USER", this.recieveUser.bind(this));
        socket.on("MOD_MSG", this.modifyMessage.bind(this));
        socket.on("UPDATE_USERS", this.updateUsers.bind(this));
    }

    getPlaceInTree(branchId, tree) {
        let stack = [];
        let current = branchId;
        while (current !== this.parentMap[current]) {
            stack.push(current);
            current = this.parentMap[current];
        }
        stack.push(current);
        let place = tree;
        while (stack.length > 0) {
            place = place.children[stack.pop()];
        }
        return place;
    }

    getObjectIndexById(arr, id) {
        return arr.findIndex((obj) => obj.id === id);
    }

    // helper functions 
    _setUsername(name) {
        this.setState({ name });
    }

    _addMessage(branchId, id, username, messageContent, alert, branchedId) {
        const message = { id, username, messageContent, alert, branchedId };
        const { branches } = this.state;
        branches[this.getObjectIndexById(branches, branchId)].messages.push(message);
        this.setState({ branches });
        let chatLogElement = document.querySelector("#"+branchId+" .chatLog");
        console.log(chatLogElement.scrollTop);
        console.log(chatLogElement.scrollHeight);
        chatLogElement.scrollTop = chatLogElement.scrollHeight;
    }

    _editMessage(branchId, id, username, messageContent, alert, branchedId) {
        const { branches } = this.state;
        const branchIndex = this.getObjectIndexById(branches, branchId);
        const branch = branches[branchIndex];
        const message = branch.messages[this.getObjectIndexById(branch.messages, id)];
        message.username = username;
        message.messageContent = messageContent;
        message.alert = alert;
        message.branchedId = branchedId;
        this.setState({ branches });
    }

    _addBranch(parentId, branchId, topic, messages, users) {
        this.parentMap[branchId] = parentId;
        const { branches, tree } = this.state;
        branches.push(
            {
                parentId,
                id: branchId,
                topic,
                messages,
                users
            }
        );
        // Check if adding a "root" branch (where parentId === ownId)
        if (parentId === branchId) {
            this.rootId = parentId;
            tree.children[parentId] = {
                content: topic,
                children: {}
            };
            this.handleSwitchBranch(parentId);
        } else {
            this.getPlaceInTree(parentId, tree).children[branchId] = {
                content: topic,
                children: {}
            };
        }
        this.setState({ branches, tree });
    }

    _addUser(id, username, branchId) {
        const user = { id, username };
        const { branches } = this.state;
        branches[this.getObjectIndexById(branches, branchId)].users.push(user);
        this.setState({ branches });
    }

    _updateUsers(branchId, users) {
        const { branches } = this.state;
        branches[this.getObjectIndexById(branches, branchId)].users = users;
        this.setState({ branches });
    }

    // methods called by socket.io functions
    recieveMessage({ branchId, id, username, messageContent, alert, branchedId }) {
        this._addMessage(branchId, id, username, messageContent, alert, branchedId);
    }

    recieveBranch({ parentId, branchId, topic, messages, users }) {
        this._addBranch(parentId, branchId, topic, messages, users);
    }

    recieveUser({ id, username, branchId }) {
        this._addUser(id, username, branchId);
    }

    updateUsers({ branchId, users }) {
        this._updateUsers(branchId, users);
    }

    modifyMessage({ branchId, id, username, messageContent, alert, branchedId }) {
        this._editMessage(branchId, id, username, messageContent, alert, branchedId);
    }


    // methods passed to child components
    handleSubmitUsername(name) {
        this._setUsername(name);
        socket.emit("INIT", name);
    }

    handleSubmitMessage(branchId, messageContent) {
        const userMessage = { branchId, username: this.state.name, messageContent };
        socket.emit("SEND_MSG", userMessage);
    }

    handleJoinBranch({ branchId, id, branchedId, messageContent }) {
        socket.emit("JOIN_BRANCH", { branchId, id, branchedId, messageContent });
    }

    handleSwitchBranch(branchId) {
        const currentBranchId = branchId;
        this.setState({ currentBranchId });
    }

    handleToggleTree() {
        const visualTreeElement = document.querySelector(".visualTree");
        const togglerText = document.querySelector(".treeViewer");
        if (visualTreeElement.style.display === "block") {
            visualTreeElement.style.display = "none";
            togglerText.textContent = "SHOW TREE";
        } else {
            visualTreeElement.style.display = "block";
            togglerText.textContent = "HIDE TREE";
        }
        // visualTreeElement.style.display = visualTreeElement.style.display === "block" ? "none" : "block";
    }

    render() {
        return (
            <div>
                <IntroPage
                onSubmitUsername={this.handleSubmitUsername.bind(this)}
                name={this.state.name}
                />
                <MainPage
                name={this.state.name}
                rootId={this.rootId}
                tree={this.state.tree}
                branchesData={this.state.branches}
                currentBranchId={this.state.currentBranchId}
                onSwitchBranch={this.handleSwitchBranch.bind(this)}
                onSubmitMessage={this.handleSubmitMessage.bind(this)}
                onJoinBranch={this.handleJoinBranch.bind(this)}
                onToggleTree={this.handleToggleTree.bind(this)}
                />
            </div>
        );
    }
}

ReactDOM.render(<AppBase />, app);

