const socket = io()

// ELements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {

    // new message element
    $newMessage = $messages.lastElementChild;

    // height of new messages
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeigth + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeigth;

    // Height of messages contanier
    const containerHeight = $messages.scrollHeight;

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

}


socket.on('message', (response) => {
    const html = Mustache.render(messageTemplate, {
        username: response.username,
        message: response.text,
        createdAt: moment(response.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (response) => {
    console.log(response);
    const html = Mustache.render(locationTemplate, {
        username: response.username,
        url: response.url,
        createdAt: moment(response.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault(); //to prevent browser refresh

    $messageFormButton.setAttribute('disabled', 'disabled')
    const msg = e.target.elements.message.value;

    socket.emit('sendmessage', msg, (error) => {

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    });
})

$locationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const locationObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', locationObj, (res) => {

            $locationButton.removeAttribute('disabled');
            console.log('Location delivered')
        });
    });
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'; //redirect to root
    }
});

// socket.on('countUpdated', (count) => {
//     console.log('the count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment')
// })