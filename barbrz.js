
//const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const https = require('https');

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
const cron = require('node-cron');
const helper = require('./config/helper');
const db = require('./models');
const barber = db.barbers;

const orders = db.orders;
const moment = require('moment'); // require

orders.belongsTo(barber, {
	foreignKey: 'barber_id',
});
/*const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/admin.barbrzclub.com/privkey.pem').toString(),
  cert: fs.readFileSync('/etc/letsencrypt/live/admin.barbrzclub.com/fullchain.pem').toString(),
  ca: fs.readFileSync("/etc/letsencrypt/live/admin.barbrzclub.com/cert.pem"),
}*/

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

 /*cron.schedule('* * * * * *',async () => {
  // console.log('running a task every second');
  var current_timestamp =Math.round((new Date().getTime() / 1000)+86400);
  console.log(current_timestamp);
  // console.log(moment(current_timestamp).format('YYYY-MM-DD HH:mm:ss'));

  all_requests = await orders.findAll({
		attributes :['id','user_id','status','barber_id','date','start_time'],
		include : [
			{
				model : barber,
				attributes : [`id`, `username`],
			}
		],		
		where:{
			start_time:current_timestamp,
			is_self:0,
			status:[3]
		}
  });
  if(all_requests){
  	 for(request of all_requests){
 		var time= moment.unix(current_timestamp).format('MMMM Do YYYY, h:mm a');

	  	const push_data={};	
		push_data.sent_to_id= request.dataValues.user_id ;
		push_data.notification_code= 7896 ;
		push_data.sent_data=request;
		push_data.body='You have a appointment with '+ request.dataValues.barber.dataValues.username+' on '+time;
		await helper.Notification(push_data);
	 }
  }
  });*/
 require('./routes/route')(app);
 require('./socket')(io);



http.listen(8081, function () {
    console.log('Node app is running on port 8081');
});




		 

