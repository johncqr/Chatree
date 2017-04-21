import React from "react";

function UserTag({ username }) {
    return (
        <li className="userTag">{username}</li>
    );
}

export default function UserList({ users }) {
    const userTags = users.map(({ id, username }) =>
        <UserTag
        key={id}
        username={username}
        />
    );
    return (
        <div className="userList">
            <h1 className="userListTitle">User List</h1>
            <ul className="tagList">
                {userTags}
            </ul>
        </div>
    );
}
