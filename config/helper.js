/* const bcrypt = require('bcrypt'); */
const config = require('./config');
const contant = require('../constant');
const crypto = require('crypto');
const path=require('path');
var uuid = require('uuid');

module.exports = {
    vaildObject: async function (required, non_required, res) {
        let message ='';
        let empty = [];
        let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';
        
        for (let key in required) {
            if (required.hasOwnProperty(key)) {
                if (required[key] == undefined || required[key] == '') {
                    empty.push(key);
                }
            }
        }

        if (empty.length != 0) {
            message = empty.toString();
            if (empty.length > 1) {
                message += " fields are required"
            } else {
                message += " field is required"
            }
            res.status(400).json({
                'success': false,
                'message': message,
                'code': 400,
                'body': {}
            });
            return;
        } else {
            if (required.hasOwnProperty('security_key')) {
                if (required.security_key != "orderup") {
                    message = "Invalid security key";
                    res.status(403).json({
                        'success': false,
                        'message': message,
                        'code': 403,
                        'body': []
                    });
                    res.end();
                    return false;
                }
            }
            if (required.hasOwnProperty('password')) {
                // const saltRounds = 10;
                // var myPromise = await new Promise(function (resolve, reject) {
                //     bcrypt.hash(required.password, saltRounds, function (err, hash) {
                //         if (!err) {

                //             resolve(hash);
                //         } else {
                //             reject('0');
                //         }
                //     });
                // });
                // // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
                // required.password = myPromise;
                // required.password = await this.getBcryptHash(required.password);
            }

            /* if (required.hasOwnProperty('checkexit')) {
                if (required.checkexit === 1) {
                    if (required.hasOwnProperty('email')) {
                        required.email = required.email.toLowerCase();

                        if (await this.checking_availability(required.email, 'email', table_name)) {
                            message = "this email is already register kindly use another";
                            res.status(403).json({
                                'success': false,
                                'message': message,
                                'code': 403,
                                'body': []
                            });
                            res.end();
                            return false;
                        }
                    }
                    if (required.hasOwnProperty('name') && required.name != undefined) {
                        required.name = required.name.toLowerCase();

                        if (await this.checking_availability(required.name, 'name', table_name)) {
                            message = "name is already in use";
                            res.status(403).json({
                                'success': false,
                                'message': message,
                                'code': 403,
                                'body': []
                            });
                            return false;
                        }
                    }

                }
            }


            if (non_required.hasOwnProperty('name') && non_required.name != undefined) {
                non_required.name = non_required.name.toLowerCase();

                if (await this.checking_availability(non_required.name, 'name', table_name)) {
                    message = "name is already in use";
                    res.status(403).json({
                        'success': false,
                        'message': message,
                        'code': 403,
                        'body': []
                    });
                    return false;
                }
            } */

            const marge_object = Object.assign(required, non_required);
            delete marge_object.checkexit;

            for(let data in marge_object){
                if(marge_object[data]==undefined){
                    delete marge_object[data];
                }else{
                    if(typeof marge_object[data]=='string'){
                        marge_object[data]=marge_object[data].trim();
                    } 
                }
            }

            return marge_object;
        }
    },
    
    error: function(res,err){
		console.log(err);
		console.log('error');
		// console.log(JSON.stringify(ReferenceError));
		// console.log(ReferenceError);
		// return false;
			let code=(typeof err==='object') ? ((err.statusCode) ? err.statusCode : ((err.code) ? err.code : 403)) : 403;
			let message=(typeof err==='object')? (err.message) : err;
			// console.log(code);
			// console.log(message);
			// return false;
			res.status(code).json({
				'success':false,
				'error_message':message,
				'code':code,
				'body':[]
			});
    },
    
    getBcryptHash: async (keyword) => {
        const saltRounds = 10;
        var myPromise = await new Promise(function (resolve, reject) {
            bcrypt.hash(keyword, saltRounds, function (err, hash) {
                if (!err) {

                    resolve(hash);
                } else {
                    reject('0');
                }
            });
        });
        // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
        keyword = myPromise;
        return keyword;
    },

    comparePass: async (requestPass, dbPass) => {
        const match = await bcrypt.compare(requestPass, dbPass);
        return match;
    },
 
    sendMail: function(object){
		const nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport('gmail',contant.mail_auth);
        
		var mailOptions = object;
		transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
            //console.log(info); 
			console.log('Email sent: ' + info.messageId);
		}
		});
    },
    Notification: function(object){
        var FCM = require('fcm-node');
        var serverKey = 'YOURSERVERKEYHERE'; //put your server key here
        var fcm = new FCM(serverKey);
     
        
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: '', 
            /* collapse_key: 'your_collapse_key', */
            
            notification: {
                title: 'Title of your push notification', 
                body: 'Body of your push notification' 
            },
            
            data: {  //you can send only notification or only data(or include both)
                my_key: 'my value',
                my_another_key: 'my another value'
            }
        };
        
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });


    },
     send_emails: function(otp,data,resu) {
        
        try {
            const nodemailer = require('nodemailer');
            
                var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'test978056@gmail.com',
                pass: 'cqlsys123'
                }
                });
                var mailOptions = {
                from: 'test978056@gmail.com',
                to: data.dataValues.email,
                subject: 'Ordersup: Forgot password',
                html: 'Click here for change password <a href="http://localhost:3000/api/url_id/' + otp + '"> Click</a>'      
                };                
                transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                console.log(error);
                } else {
                console.log(info);
                res.send('Email send');
                }
              });
             return resu;
        } catch (err) {
          throw err;
        }
        }, 
            
    createSHA1: function() {
        let key = 'abc'+new Date().getTime();
        return crypto.createHash('sha1').update(key).digest('hex');        
    },
    image_upload: async function(image){
       if (image) {
            var extension = path.extname(image.name);
            var filename = uuid() + extension;
            var sampleFile = image;
            sampleFile.mv(process.cwd() + '/public/images/users/' + filename, (err) => {
                if (err) throw err;
            });

            return filename;
        }

    },
    
      
}