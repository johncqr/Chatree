import React from "react";

import Branch from "./Branch";
import VisualTree from "./VisualTree";

export default function MainPage({ name, rootId, tree, branchesData, 
    currentBranchId, onSwitchBranch, onSubmitMessage, 
    onJoinBranch, onToggleTree}) {

    // checks if name is set to hide/show MainPage
    const style = {
        display: name ? "block" : "none"
    }

    const branches = branchesData.map(({ id, topic, messages, users }) => {
        let activeBranch = id === currentBranchId;
        return (
            <Branch
            key={id}
            id={id}
            topic={topic}
            messages={messages}
            users={users}
            onSubmitMessage={onSubmitMessage}
            onJoinBranch={onJoinBranch}
            activeBranch={activeBranch}
            />
        );
    });

    return (
        <div className="mainPage" style={style}>
            <div className="treeWidget">
                <div className="treeViewer" onClick={onToggleTree} >{"SHOW TREE"}</div>
                <VisualTree
                rootId={rootId}
                tree={tree}
                onSwitchBranch={onSwitchBranch}
                currentBranchId={currentBranchId}
                />
            </div>
            <div className="branches">
            {branches}
            </div>
        </div>
    );
}