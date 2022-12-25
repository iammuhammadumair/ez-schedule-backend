const db = require('../models');
const user = db.users;
const config = require('./config');
const contant = require('../constant');
const crypto = require('crypto');
const path = require('path');
var uuid = require('uuid');
const posts = db.posts;
const postsImages = db.postsImages;
const sequelize = require('sequelize');
const Op = sequelize.Op;
const superagent = require('superagent');

posts.hasMany(postsImages)
module.exports = {
     isJson(item) {
    item = typeof item !== "string" ? JSON.stringify(item) : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === "object" && item !== null) {
      return true;
    }

    return false;
  },
    vaildObject: async function (required, non_required, res) {
        let message = '';
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
                'msg': message,
                'code': 400,
                'body': {}
            });
            return;
        } else {
            if (required.hasOwnProperty('auth_key')) {
                  const user_auth_check = await user.findOne({
                    attributes:['id','auth_key'],
                    where: {
                      auth_key: required.auth_key,
                    }
                  });
                  if(!user_auth_check){
                    message = "Invalid authorization";
                    res.status(400).json({
                        'success': false,
                        'msg': message,
                        'code': 400,
                        'body': []
                    });
                    res.end();
                    return false;
                  }else{
                    if (required.hasOwnProperty('return_type')) {
                        if(required.return_type==1){

                             required.user_id=user_auth_check.dataValues.id;
                        }else{
                             required.barber_id=user_auth_check.dataValues.id;

                        }
                      }
                 }

                    
                
            }
            if (required.hasOwnProperty('security_key')) {
                if (required.security_key != "barbuz@123") {
                    message = "Invalid security key";
                    res.status(403).json({
                        'success': false,
                        'msg': message,
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

            for (let data in marge_object) {
                if (marge_object[data] == undefined) {
                    delete marge_object[data];
                } else {
                    if (typeof marge_object[data] == 'string') {
                        marge_object[data] = marge_object[data].trim();
                    }
                }
            }

            return marge_object;
        }
    },

    error: function (res, err) {
        console.log(err);
        console.log('error');
        // console.log(JSON.stringify(ReferenceError));
        // console.log(ReferenceError);
        // return false;
        let code = (typeof err === 'object') ? ((err.statusCode) ? err.statusCode : ((err.code) ? err.code : 403)) : 403;
        let message = (typeof err === 'object') ? (err.message) : err;
        // console.log(code);
        // console.log(message);
        // return false;
        res.status(code).json({
            'success': false,
            'msg': message,
            'code': code,
            'body': []
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

    sendMail: function (object) {
        const nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport('gmail', contant.mail_auth);

        var mailOptions = object;
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                //console.log(info); 
                console.log('Email sent: ' + info.messageId);
            }
        });
    },
        all_users_Notification: async function (object) {
            // return true;
        
        var FCM = require('fcm-node');
        var serverKey = 'AAAA1n3rge4:APA91bFeTKfPKnJRZqcnVQCX5-zrnBCXQvzISjzUNgDnqZ2-0nnbmgTzO8jyI6kHcCrwi30RvYSWTufhnLYVtof-C8ZjJTm2ZrY0iVDr47lnan3i6aJgfTcPV-K1PuK5Y4FW9kAZJTOn'; //put your server key here
        var fcm = new FCM(serverKey);
        console.log(object.sent_to_id);
        // object.sent_to_id=[2,4];
         user_detail =await  user.findAll({
            attributes:['id','device_type','device_token'],
            where: {
              id: object.sent_to_id,
              /*[Op.in]: [
                    {id :object.sent_to_id }
                ]*/
            }
          });
        console.log(user_detail);
        // return;
        if(!user_detail){
            return true;
        }else{
                final_sent=[];
              for(let j in user_detail) { 
                final_sent.push(user_detail[j].dataValues.device_token);
              }
      // console.log(final_sent);
      // return;


            if (final_sent) {
                notification_obj = {
                        title: object.body,
                        badge:1,
                        sound: "default",
                        priority: "high",
                        notification_code: object.notification_code,
                        timeStamp:Math.floor(Date.now() / 1000),
                        Unread:""
                        // body: object.body
                };

                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    // to: 'c1fvIcmhRyGHMG2JfIF0H7:APA91bFAOkscDgiQ3fWj26LevehpwFm-MU86sBDZywD2QGRfM_iJNH8JLrqzfS29XlovLRL7t7qgJPCFsJ3-qOQs0HUN1A3e9XfY1uB2SYkooV6PysP8bkylxO8uLS4WX3eR2V6L0n34',
                    prioriy: "high",                    
                    registration_ids : final_sent,
                    notification: {
                                title: object.body,
                                badge:1,
                                sound: "default",
                                priority: "high",
                                notification_code: object.notification_code,
                                type: object.notification_code,
                                timeStamp:Math.floor(Date.now() / 1000),
                                Unread:""
                                // body: object.body
                        },

                    data: {
                      prioriy: "high",
                      body: {
                        type: object.notification_code,
                        data : object.sent_data,                        
                        title: object.body,
                        badge:1,
                        sound: "default",
                        notification_code: object.notification_code,
                        timeStamp:Math.floor(Date.now() / 1000),
                        Unread:""
                      },
                      notification:notification_obj,
                      type: object.notification_code,
                    },

                };
                // console.log(message);
                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
            }
        }
        


    },
     Notification: async function (object) {
            // return true;
        
        var FCM = require('fcm-node');
        var serverKey = 'AAAA1n3rge4:APA91bFeTKfPKnJRZqcnVQCX5-zrnBCXQvzISjzUNgDnqZ2-0nnbmgTzO8jyI6kHcCrwi30RvYSWTufhnLYVtof-C8ZjJTm2ZrY0iVDr47lnan3i6aJgfTcPV-K1PuK5Y4FW9kAZJTOn'; //put your server key here
        var fcm = new FCM(serverKey);

        const user_detail =await  user.findOne({
            attributes:['id','device_type','device_token'],
            where: {
              id: object.sent_to_id,
            }
          });

        if(!user_detail){
            return true;
        }else{
            if (user_detail.dataValues.device_token) {
                notification_obj = {
                        title: object.body,
                        badge:1,
                        sound: "default",
                        priority: "high",
                        notification_code: object.notification_code,
                        timeStamp:Math.floor(Date.now() / 1000),
                        Unread:""
                        // body: object.body
                };

                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    // to: 'c1yFVQp7QFSzINoV2wuSAd:APA91bFCZ-wgSRxU-yK4u399DOu6A9qIgnznZzD2Bvc6EUfP5BBvjqtHWSw4DF1TG6G8bJNHNPjBfwAjfwdKVpfuTHhTShj5890YoyyJoMLcBdylg1n_f4C1js8ll-2Y88IUT67QoaAE',
                    prioriy: "high",                    
                    to : user_detail.dataValues.device_token,
                    notification: {
                                title: object.body,
                                badge:1,
                                sound: "default",
                                priority: "high",
                                notification_code: object.notification_code,
                                type: object.notification_code,
                                timeStamp:Math.floor(Date.now() / 1000),
                                Unread:""
                                // body: object.body
                        },

                    data: {
                      prioriy: "high",
                      body: {
                        type: object.notification_code,
                        data : object.sent_data,                        
                        title: object.body,
                        badge:1,
                        sound: "default",
                        notification_code: object.notification_code,
                        timeStamp:Math.floor(Date.now() / 1000),
                        Unread:""
                      },
                      notification:notification_obj,
                      type: object.notification_code,
                    },

                };
                // console.log(message);
                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
            }
        }
        


    },
    refresh_squareup_auth_token: async function (barber_id,refresh_token) {
            var send={};

      await  superagent
          .post('https://connect.squareup.com/oauth2/token')
          .send({ 
                /*client_id: 'sandbox-sq0idb-nllUHLfpANX_XRfWx2ENxw',
                client_secret:'sandbox-sq0csb-G7v_m4fEcZ6GZqUptLITKnrE5j4-vDzw2poC0VmEQKQ',*/
            client_id: 'sq0idp-f461Wa_wzlC_9Xbe1rtUlA',
            client_secret:'EAAAEKx1T18tzQeWjmuSYa5oftdJAyx4L8tqhhGRpgXYBFHDf1UaLYNT3vdNLYr7',
            // code:'sandbox-sq0cgb-724JRU3vslXl7qbAZViFBA',
            // grant_type:'authorization_code'
            refresh_token:refresh_token,
            grant_type:'refresh_token'  
            }) // sends a JSON post body
          .set('Square-Version', '2020-03-25')
          .set('Content-Type', 'application/json')
          .end((err, result_oauth) => {
            if(err){
                // console.log(err);
                send.is_error=true;
                send.error_message=err.response.body.message;
            // return send;
                
            }else{
                // console.log(result_oauth);   
                // console.log(result_oauth.body); 
                var current_timestamp = new Date().getTime() / 1000;

                const save_token =  user.update({
                    access_token: result_oauth.body.access_token,
                    refresh_token: result_oauth.body.refresh_token,
                    access_token_save_time: current_timestamp

                },
                {
                    where:
                    {
                        id: barber_id
                    }
                });
                send.is_error=false;
                send.access_token=result_oauth.body.access_token;
            // return send;

            }
            // console.log(send);
            return send;
            // Calling the end function will send the request
        });

    },
       twilio_sms: async function (msg_obj,req) {

        msg_obj.To='+'+msg_obj.To;
         // try {
            superagent
              .post('https://api.twilio.com/2010-04-01/Accounts/AC37a6e1a71ca76e15d6a279ec48aa13f1/Messages.json')
              .send({ Body: msg_obj.Body, From: '+19086381491',To :msg_obj.To }) // sends a JSON post body
              .auth('AC37a6e1a71ca76e15d6a279ec48aa13f1', 'be670ed21cc9b2efb768fca409bd247e')
              // .set('Authorization', 'Basic QUMzN2E2ZTFhNzFjYTc2ZTE1ZDZhMjc5ZWM0OGFhMTNmMTpiZTY3MGVkMjFjYzliMmVmYjc2OGZjYTQwOWJkMjQ3ZQ==')
              // .set('Authorization', 'Basic AC37a6e1a71ca76e15d6a279ec48aa13f1:be670ed21cc9b2efb768fca409bd247e')
              .set('Content-Type', 'application/x-www-form-urlencoded')
              .end((err, res) => {
                    if(err){
                            console.log(err);
                        // throw err;
                    }else{
                        console.log(res);
                    }
                // Calling the end function will send the request
             });
        //  } catch (err) {
        //     throw err;
        // }
    },
    userdetail: async function (userid, req) {
        // console.log(userid);
        try {
            const data = await user.findOne({
                attributes: [`id`, `username`, `language`,`subscription_id`,`subscription_status`, `profile_image`, `phone`, `email`, `user_type`,`otp_verified`, `lat`, `lng`, `address`,`description`,`open_time`,`close_time`, `auth_key`, `device_type`, `device_token`,`reward_percentage`,`reward_order_count`,`access_token`,`schedule`],
                where: {
                    id: userid,
                }
            });
            data.dataValues.square_id="";

            if(data.dataValues.access_token){
                data.dataValues.square_id=1;
                // console.log(req.protocol + '://' + req.get('host'));
                // data.dataValues.profile_image = req.protocol + '://' + req.get('host') + '/images/users/' + data.dataValues.profile_image;
                //  console.log(data);
            }
                //  console.log(data.dataValues.profile_image);

            return data;
        } catch (err) {
            // console.log(err);
            throw err;
        }
    },
    postdetail: async function (userid,postid,req) {
    try {

            const postdata = await posts.findOne({
                attributes: [`id`, `userId`, `catId`, `description`, `status`,
                    [sequelize.literal('UNIX_TIMESTAMP(posts.createdAt)'), 'createdAt'],
                    [sequelize.literal('(SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)'), 'totalvote'],
                    [sequelize.literal('(SELECT case when `profile_image`="" then "" else  CONCAT("http://' + req.get('host') + '/images/users/", profile_image) end as userimage FROM users where id = posts.userId)'), 'userimage'],
                    [sequelize.literal('(SELECT username FROM users where id = posts.userId)'), 'username'],
                    [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `postId`=posts.id and userId=' + userid + ')'), 'is_vote'],
                ],
                where: {
                    status: 1,
                    id: postid,
                },
                include: [{
                    model: postsImages,
                    attributes: ['id',
                        [sequelize.literal('case when postsImages.`images`="" then "" else  CONCAT("http://' + req.get('host') + '/images/post/", postsImages.images) end'), 'images'],
                        [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `imageId`=postsImages.id and userId=' + userid + ')'), 'is_imagevote'],
                        [sequelize.literal('(SELECT  ifnull(count(*),0) as count FROM `votecasting` WHERE `imageId`=postsImages.id)'), 'imagevote'],
                        [sequelize.literal('(SELECT ifnull(round((((SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `imageId`=postsImages.id) / (SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)) * 100),2),0) )'), 'percentage'],
                    ],
                    on: {
                        col1: sequelize.where(sequelize.col('postsImages.postId'), '=', sequelize.col('posts.id')),
                    },
                }],
            });
            return postdata;
        } catch (err) {
            throw err;
        }
    },
      send_emails: function (otp, data, resu) {
                    
        var message='<div style="text-align: center; color: white; height: 250px; background-color: rgba(0,0,0,0.5); border: 1px solid #456;border-radius: 3px; padding: 10px;"><img src="http://52.12.76.190:8081/images/logo.png" height="80px" width="80px"><h2 style="color: white;" >Hello ' +data.dataValues.username+ '</h2><strong>Please click the following link to set your password.</strong><br /><a style="color: white;" href=http://52.12.76.190:8081/api/url_id/'+ otp +'> Click</a></div>';      
        // console.log(message);
        // return;
        superagent
          .post('https://api.postmarkapp.com/email')
          .send(
            {
                "From": "admin@barbrzclub.com",
                "To": data.dataValues.email,
                // "To": 'mrajay343@gmail.com',
                "Subject": "EZ Schedule Forgot Password",
                "HtmlBody": message,
                "MessageStream": "outbound"
              }
            ) // sends a JSON post body
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('X-Postmark-Server-Token', '101ea3cc-2358-4ad9-b2af-67abd0ae92a7')

          .end((err, res) => {
                if(err){
                        console.log(err);
                    // throw err;
                }else{
                    console.log(res);
                }
            // Calling the end function will send the request
         });
    },

send_emails_nodemailer: function (otp, data, resu) {

        try {
            const nodemailer = require('nodemailer');

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'abc@gmail.com',
                    pass: 'c123'
                }
            });
            var mailOptions = {
                from: 'abc@gmail.com',
                to: data.dataValues.email,
                subject: 'Vote Cast: Forgot password',
                html: 'Click here for change password <a href="http:IP_address/api/url_id/' + otp + '"> Click</a>'
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
    createSHA1: function () {
        let key = 'abc' + new Date().getTime();
        return crypto.createHash('sha1').update(key).digest('hex');
    },
    image_upload: function (image,folder_name='users') {
        if (image) {
            var extension = path.extname(image.name);
            var filename = uuid() + extension;
            var sampleFile = image;
            sampleFile.mv(process.cwd() + '/public/images/'+ folder_name +'/' + filename, (err) => {
                if (err) throw err;
            });

            return filename;
        }

    },
    image_upload_post: function (image) {
        if (image) {
            var extension = path.extname(image.name);
            var filename = uuid() + extension;
            var sampleFile = image;
            sampleFile.mv(process.cwd() + '/public/images/post/' + filename, (err) => {
                if (err) throw err;
            });

            return filename;
        }

    },


}