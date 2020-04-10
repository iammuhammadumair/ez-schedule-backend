
//const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');


//console.log(swaggerUi,"=============swaggerUi");
const fs = require('fs');
const Sequelize = require('sequelize');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');
const uuid = require('uuid');
const expressValidator = require('express-validator');

const mailer = require('express-mailer');
const crypto = require('crypto');
const flash = require('express-flash');
const session = require('express-session');


app.use(session({secret: 'ssshhhhh'}));
app.use(flash());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

 require('./routes/route')(app);
 require('./socket')(io);



http.listen(3182, function () {
    console.log('Node app is running on port 3182');
});




		 

