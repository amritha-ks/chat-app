const users = [];

// add user

const addUser = ({ id, username, room }) => {

    // Clear the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find(val => val.room === room && val.username === username)

    // validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // store user
    const user = {
        id,
        username,
        room
    }
    users.push(user);
    return { user };
}

// remove user
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// get user
const getUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users[index]
    }
    return {
        error: 'User not found'
    }
}

// get users in room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}