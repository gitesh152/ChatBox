users=[]

const addUser=({id,username,room})=>{
    //santize the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //check if they were given
    if(!username || !room)
    return {error:'Username and Room is required!'}

    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })
    if(existingUser) return {error:'Username is already in use!'}

    //store user
    const user={id,username,room}
    users.push(user)
    return {user}
}
//lets make removeUser
removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)
    if(index!==-1) return users.splice(index,1)[0] 
}


//lets make getUser
const getUser=(id)=>{
    return users.find((user)=>user.id===id)
}

//lets make getUsersInRoom
const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
                }
