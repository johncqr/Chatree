import React from "react";

function VisualBranch({ id, branchId, content, children, onSwitchBranch, currentBranchId }) {

    const handleClick = (e) => {
        onSwitchBranch(branchId);
    }
    
    // Recursively get child elements
    const childVisualBranches = [];
    for (const key in children) {
        if (children.hasOwnProperty(key)) {
            childVisualBranches.push(
            <VisualBranch 
            key={key}
            id={key}
            branchId={key}
            content={children[key].content}
            children={children[key].children}
            onSwitchBranch={onSwitchBranch}
            currentBranchId={currentBranchId}
            />
            );
        }
    }

    const linkClassName = "visualBranchLink" + (branchId === currentBranchId ? " active" : "");

    return (
        <div className="visualBranch">
            <li id={id} className={linkClassName} onClick={handleClick}>{content}</li>
            <ul>
                {childVisualBranches}
            </ul>
        </div>
    );
}

export default function VisualTree({ rootId, tree, onSwitchBranch, currentBranchId }) {
    return (
        <div className="visualTree" style={{display: "none"}}>
            <VisualBranch
            id={rootId}
            branchId={rootId}
            content={"Tree"}
            children={tree.children} 
            onSwitchBranch={onSwitchBranch}
            currentBranchId={currentBranchId}
            />
        </div>
    );
}