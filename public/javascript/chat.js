//io()  //to connect to server
const socket=io()  //Now recieving data of io fn in var socket

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLocation=document.querySelector('#sendLocation')
const $messages=document.querySelector('#messages')


//template
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})  //qs=query string , ignoreQueryPrefix to ignore '?'

const autoscroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild

    //height of new message
    const newMessageStyles=getComputedStyle($newMessage)  //getting computed style of newMessage
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin  //offsetHeight exclude margin value

    //visible height (the amount of height i can see in message container)
    const visibleHeight=$messages.offsetHeight

    //container height (message conatainer height (visible height+invisible height of message container that cant be seen))
    const containerHeight=$messages.scrollHeight

    //How far have i scrolled ?
    const scrollOfffset=($messages.scrollTop  + visibleHeight)*2       //scrolltop=amount we have scrolled from top

    //code to auto scrolldown
    if((containerHeight-newMessageHeight) <= scrollOfffset)
    {
        $messages.scrollTop=$messages.scrollHeight //pushing to bottom  (if want always autoscroll down this line sud be used)
    }
    console.log(containerHeight,newMessageHeight,scrollOfffset)
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{ 
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A') 
        })  
    $messages.insertAdjacentHTML('beforeend',html) 
    autoscroll()
    //$messages.scrollTop=$messages.scrollHeight
})

socket.on('locationMessage',(message)=>{
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    // console.log(room)
    // console.log(users)
    //=>room,array of user objs
    //now we have userslist , so we render it in sidebar, first we create template and sidebar to render it.
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html 
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')  //disable button
    const message=e.target.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')  //enable button
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error) return console.log(error) 
        console.log('Message Delivered!')
    })  //using 3rg arg for acknowledge
})

$sendLocation.addEventListener('click',(e)=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser.')
    }   
    $sendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{   //getCurrentPosition fn is async but doesnot support promise or async await
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared !')
        })
    })
})

//At last emit for join
socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error) 
        location.href='/'  //redirecting to index join page
    }
})