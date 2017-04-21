import React from "react";

import UserList from "./UserList";
import ChatBase from "./ChatBase";

export default function Branch({ id, topic, messages, users, onSubmitMessage, onJoinBranch, activeBranch }) {
    
    // checks boolean value of activeBranch to display Branch
    const style = {
        display: activeBranch ? "block" : "none"
    };

    return (
        <div id={id} className="branch" style={style} >
            <h1 className="branchTopic">{topic}</h1>
            <UserList users={users} />
            <ChatBase
            branchId={id}
            messages={messages}
            onSubmitMessage={onSubmitMessage}
            onJoinBranch={onJoinBranch}
            />
        </div>
    );
}