const express = require('express');
const { readFile } = require('fs').promises;
const app = express();
const port = 3000;

var mongoose = require('mongoose');
var dbURL = 'mongodb+srv://programuser:dontdoxme@clusterzero.yhx1e.mongodb.net/chat?retryWrites=true&w=majority';

//Connecting to the DB
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB Connected…');
  })
  .catch(err => console.log(err))

var Message = mongoose.model('Message', {userID: String, content: String, date: Date, wasEdited: Boolean, editDate: Date});

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//How messages are loaded from DB
app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=> {
      res.send(messages);
    })
    console.log("app.get");
});

//How messages are sent to DB
app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    console.log("app.post");
    res.sendStatus(200);
  })
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', () => {
    console.log('a user is connected');
});

//Used to serve the CSS sheet for the webpage
app.use(express.static('pages/static/'));

//Displays the home.html file upon starting the node app
app.get('/', async (request, response) => {
    response.send(await readFile('./pages/home/home.html', 'utf8'));
});

var server = http.listen(port, () => console.log(`App available on http://localhost:${port}`));