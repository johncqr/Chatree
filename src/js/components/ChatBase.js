import React from "react";

function ChatMessage({ branchId, id, username, messageContent, alert, branchedId, onJoinBranch }) {
    const handleClick = (e) => {
        onJoinBranch({branchId, id, branchedId, messageContent});
    }
    return (
        <div className="chatMessage" onClick={handleClick}>
            <span className="usernameText">{username}</span>
            <span className="chatSep">{":  "}</span>
            <span className="messageText">{messageContent}</span>
            <div className="alertText">{alert}</div>
        </div>
    );
}

function ChatLog({ branchId, messages, onJoinBranch }) {
    const chatMessages = messages.map(({ id, username, messageContent, alert, branchedId }) =>
        <ChatMessage
        key={id}
        branchId={branchId}
        id={id}
        username={username}
        messageContent={messageContent}
        alert={alert}
        branchedId={branchedId}
        onJoinBranch={onJoinBranch}
         />
    );
    return (
        <div className="chatLog">
            {chatMessages}
        </div>
    );
}

function ChatInput({ branchId, onSubmitMessage }) {
    const handleKeyDown = (e) => {
        // Submits message if there is content and the Enter key is pressed
        if (e.target.value && e.which === 13) {
            onSubmitMessage(branchId, e.target.value);
            e.target.value = "";
        }
    }
    return (
        <input
        className="chatInput"
        onKeyDown={handleKeyDown}
        placeholder="Enter your message here..."
        />
    );
}

export default function ChatBase({ branchId, messages, onSubmitMessage, onJoinBranch}) {
    return (
        <div className="chatBase">
            <ChatLog
            branchId={branchId}
            messages={messages}
            onJoinBranch={onJoinBranch}
            />
            <ChatInput
            branchId={branchId}
            onSubmitMessage={onSubmitMessage}
            />
        </div>
    );
}