import React from "react";

function UsernameInput({ onSubmitUsername}) {
    const handleKeyDown = (e) => {
        // Submits username if there is content and the Enter key is pressed
        if (e.target.value && e.which === 13) {
            onSubmitUsername(e.target.value);
            e.target.value = "";
        }
    }
    return (
        <input
            className="usernameInput"
            onKeyDown={handleKeyDown}
            placeholder="Enter a username..."
        />
    );
}

export default function IntroPage({ onSubmitUsername, name }) {
    const style = {};
    if (name) {
        style.display = "none";
    }

    const infostructions = `
    Chatree is a chat application where you can "branch" your conversations. Click
    on any chat message to create a new branch and then enter the newly joined room
    in the "tree" at the top of the page. Enter a username to get started!
    `

    return (
        <div className="introPage" style={style}>
            <h1>Chatree</h1>
            <p>{infostructions}</p>
            <UsernameInput onSubmitUsername={onSubmitUsername} />
        </div>
    );
}