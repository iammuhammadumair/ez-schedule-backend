const db = require('./models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
var users = db.users;
var chat = db.chat;
var constant = db.constant;
var blockedUser = db.blockedUser
var onlineUser = db.onlineUser;
const fun = require('./function/socketFunction');
//const fun2 =require('./function/fun.js');
//const functions =require('./function/function.js');
// const functions = require('./function/api_fun.js');
module.exports = function (io) {
  
  io.on('connection', function (socket) {
    console.log('a user connected');
    
    socket.on('connect_user', async function (connect_listener) {
      try {
        var socket_id = socket.id
        let check_user = await onlineUser.findOne({

          where: {
            userid: connect_listener.userid
          }
        });
        console.log(socket_id)

        if (check_user) {

          create_socket_user = await onlineUser.update({
            status: 1,
            socketId: socket_id,
          },
            {
              where: {
                userid: connect_listener.userid
              }
            }
          );


        } else {
          create_socket_user = await onlineUser.create({
            userid: connect_listener.userid,
            socketId: socket_id,
            status: 1,
            createdAt: await fun.create_time_stamp(),
          })
        }
        success_message = [];
        success_message = {
          'success_message': 'connected successfully'
        }
        socket.emit('connect_listener', success_message);
      } catch (error) {
        throw error
      }
    });
    socket.on('send_message', async function (get_data) {
      try {
        let find_block=await blockedUser.findOne({
          where:{
            userby:get_data.user2Id,
            userto:get_data.userid
          }
        })
        if(!find_block){
        if (get_data.messageType == 1) {
          extension_data = get_data.extension
          convert_image = await fun.image_base_64(get_data.message, extension_data);
          get_data.message = convert_image;
        }
      
        var user_data = await constant.findOne({
          where: {

            [Op.or]: [
              { userid: get_data.userid, user2Id: get_data.user2Id },
              { user2Id: get_data.userid, userid: get_data.user2Id }

            ]
          }

        });
        // console.log(user_data,"saBvghvaDVghadVghk");return;

        if (user_data) {
          create_message = await chat.create({
            userid: get_data.userid,
            user2Id: get_data.user2Id,
            msgType: get_data.messageType,
            message: get_data.message,
            constantid: user_data.dataValues.id,
            createdAt: await fun.create_time_stamp(),
            //  updated: await this.create_time_stamp(),
          })

          update_last_message = await constant.update({

            lastMsgId: create_message.dataValues.id,
            deletedId: 0,
            createdAt: await fun.create_time_stamp(),
          },
            {
              where: {
                id: user_data.dataValues.id
              }
            }
          );
          getdata = await chat.findOne({
            attributes: ['id', [sequelize.literal('(SELECT username FROM users WHERE users.id  = chat.userid)'), 'SenderName'], 'message',
            [sequelize.literal('(SELECT id FROM users WHERE users.id  = chat.userid)'), 'SenderID'],
             [sequelize.literal('(SELECT profile_image FROM users WHERE users.id  = chat.userid)'), 'SenderImage'],
              [sequelize.literal('(SELECT username FROM users WHERE users.id  = chat.user2Id)'), 'ReceiverName'],
              [sequelize.literal('(SELECT id FROM users WHERE users.id  = chat.user2Id)'), 'ReceiverId'],
              [sequelize.literal('(SELECT profile_image FROM users WHERE users.id  = chat.user2Id)'), 'ReceiverImage'], 'msgType', 'createdAt'],
            where: {
              id: create_message.dataValues.id
            }
          });
          //console.log(getdata,"getdatagetdatagetdatagetdata");return
          if (getdata) {
            get_id = await onlineUser.findOne({
              where: {
                userid: get_data.user2Id
              }

            })

            console.log(get_id.socketId,"get_socket_id");
            if (get_id) {
              socket.emit("body", getdata);
            }
            io.to(get_id.socketId).emit('body', getdata);
       //     var get_list = await fun.get_chat_list(get_data);
       //     io.to(get_id.socketId).emit('get_list', get_list);

          }

        } else {

          let create_last_message = await constant.create({
            userid: get_data.userid,
            user2Id: get_data.user2Id,
            lastMsgId: 0,
            createdAt: await fun.create_time_stamp(),
          });

          create_message = await chat.create({
            userid: get_data.userid,
            user2Id: get_data.user2Id,
            msgType: get_data.messageType,
            message: get_data.message,
            constantid: create_last_message.dataValues.id,
            createdAt: await fun.create_time_stamp(),

          });

          update_last_message = await constant.update({

            lastMsgId: create_message.dataValues.id
          },
            {
              where: {
                id: create_last_message.dataValues.id
              }
            }
          );
          getdata = await chat.findOne({
            attributes: ['id',
             [sequelize.literal('(SELECT username FROM users WHERE users.id=  chat.userid)'), 'SenderName'], 'message',
             [sequelize.literal('(SELECT id FROM users WHERE users.id= chat.userid)'), 'SenderID'],
              [sequelize.literal('(SELECT profile_image FROM users WHERE users.id=  chat.userid)'), 'SenderImage'], 
              [sequelize.literal('(SELECT username FROM users WHERE users.id=  chat.user2Id)'), 'ReceiverName'],
              [sequelize.literal('(SELECT id FROM users WHERE users.id= chat.user2Id)'), 'ReceiverId'],
               [sequelize.literal('(SELECT profile_image FROM users WHERE users.id  = chat.user2Id )'), 'ReceiverImage'], 'msgType', 'createdAt'],
                where: {
                  id: create_message.dataValues.id
                }
          });
          if (getdata) {
            get_id = await onlineUser.findOne({
              where: {
                userid: get_data.user2Id
              },
              raw: true
            })
            if (get_id) {
              socket.emit("body", getdata);
            }
            io.to(get_id.socketId).emit('body', getdata);
            //var get_list = await fun.get_chat_list(get_data);
            //io.to(get_id.socketId).emit('get_list', get_list);
          }

        }
      }
      else{
        success_message = []
        success_message = {
          'success_message': 'You are blocked by this user'
        }
        socket.emit('body', success_message);
      }

      } catch (error) {
        throw error
      }
    });
    socket.on('get_chat', async function (data) {
      if (data) {
        var get_data_chat = await fun.GetChat(data);
        console.log(get_data_chat, "get_data_chatget_data_chat")

        if (get_data_chat) {
          socket.emit('my_chat', get_data_chat);
        }
      }

    });

    socket.on('get_chat_list', async function (data) {
      try {
        if (data) {
          var get_list = await fun.get_chat_list(data);
          if (get_list) {
            socket.emit('get_list', get_list);
          }

        }
      } catch (error) {
        console.log(error, "========error=========");
      }

    });
    socket.on('get_typing_list', async function (data) {
      try {
        if (data) {
          let message="";
          var get_list2 = await fun.get_typing_list(data);
          get_id = await onlineUser.findOne({
            where: {
              userid: data.user2Id
            }

          })
          if (get_id) {
            var get_list = await fun.get_chat_list(data);
            io.to(get_id.socketId).emit('get_list', get_list);
          }
          if(data.status==0) {
            message="typing off";
          } else {
            message="typing on";
          }
          socket.emit('typing_listener', message);
        }
      } catch (error) {
        console.log(error, "========error=========");
      }

    });
    
    socket.on('clear_chat', async function (clear_chat) {
      try {

        let clear_chat_data = await fun.clear_chat(clear_chat)
        success_message = []
        success_message = {
          'success_message': 'Chat Clear Successfully'
        }
        socket.emit('clear_data', success_message);

      } catch (error) {
        throw error
      }
    });
    socket.on('delete_chat', async function (delete_chat) {
      try {

        let delete_chat_data = await fun.delete_msg(delete_chat)
        success_message = []
        success_message = {
          'success_message': 'Chat Deleted Successfully'
        }

        socket.emit('delete_data', success_message);

      } catch (error) {
        throw error
      }
    });
    socket.on('disconnect', async function () {

      let socket_id = socket.id
      let socket_disconnect = await fun.socket_disconnect(socket_id)

      console.log('socket user disconnected');
    });
    socket.on('read_unread', async function (get_read_status) {

      let get_read_unread = await fun.get_read_unread_status(get_read_status);
      get_read_unread = {}
      get_read_unread.read_status = 1
      socket.emit('read_data_status', get_read_unread)
  
    });


    socket.on('blockUnblock_user', async function (delete_chat) {
      try {

        let blockUnblock_user = await fun.blockUnblock_user(delete_chat)
        success_message = []
        if(delete_chat.type==1){
        success_message = {
          'success_message': 'User Block Successfully'
        }
      }
     else if(delete_chat.type==2){
        success_message = {
          'success_message': 'User unblock Successfully'
        }
      }
        socket.emit('block_data', success_message);

      } catch (error) {
        throw error
      }
    });
  });
 
}