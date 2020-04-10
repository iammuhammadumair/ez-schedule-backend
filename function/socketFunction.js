const db = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
var users = db.users;
var chat = db.chat;
var constant = db.constant;
var onlineUser = db.onlineUser;
var blockedUser = db.blockedUser
var path = require('path');
var uuid = require('uuid');
const fs = require('fs');
const database = require('../db/db.js');


//const fun2 =require('./function/fun.js');
//const functions =require('./function/function.js');
// const functions = require('./function/api_fun.js');
module.exports = {

  create_time_stamp: async function () {

    let current_time = Math.round(new Date().getTime() / 1000)

    return current_time;
  },
  data_to_send: async function (get_data) {
    final_array = [];
    final_array = {
      senderId: get_data.senderId,
      receiverId: get_data.receiverId,
      messageType: get_data.messageType,
      message: get_data.message,
      senderName: get_data.senderName,
      senderProfileImage: get_data.senderProfileImage,
      receiverName: get_data.receiverName,
      RecieverProfileImage: get_data.RecieverProfileImage,
      created: await this.create_time_stamp(),

    }
    return final_array;

  },
  GetChat: async function (msg) {
    console.log(msg)

    var constant_check = await constant.findOne({
      where: {
        [Op.or]: [
          { userid: msg.userid, user2Id: msg.user2Id },
          { userid: msg.user2Id, user2Id: msg.userid }
        ]
      }
    });
    if (constant_check) {
      constant_check = constant_check.toJSON();
      var get_message = await chat.findAll({
        attributes: ['id', [sequelize.literal('(SELECT username FROM users WHERE users.id  = chat.userid)'), 'SenderName'], 'message',
        [sequelize.literal('(SELECT id FROM users WHERE users.id  = chat.userid)'), 'SenderID'],
         [sequelize.literal('(SELECT profile_image FROM users WHERE users.id  = chat.userid)'), 'SenderImage'],
          [sequelize.literal('(SELECT username FROM users WHERE users.id  = chat.user2Id)'), 'ReceiverName'],
          [sequelize.literal('(SELECT id FROM users WHERE users.id  = chat.user2Id)'), 'ReceiverId'],
          [sequelize.literal('(SELECT profile_image FROM users WHERE users.id  = chat.user2Id)'), 'ReceiverImage'], 'msgType', 'createdAt'],
        where: {
          constantId: constant_check.id,
          deletedId: {
            [Op.ne]: msg.userid
          }
        }
      });
      console.log(get_message)
      if (get_message) {
        get_message = get_message.map(val => {
          var data = val.toJSON();
          // data.user_name="";
          // data.user_image=""
          // var tm1 =new Date(data.created_at);
          // var tim1 =  Math.round(tm1.getTime() / 1000);
          // data.createdAt =tim1;
          return data;
        });
        return get_message;
      }
    } else {
      return []
    }
  },
  get_chat_list: async function (get_chat_data) {

    var get_message = await database.query(`select *,(select Count(*) from chat where (user2id=${get_chat_data.userid} and userid=user_id) and (read_status=0) ) as unreadcount,(SELECT case when count(*) =0 then 0 else 1 end as blockstatus  FROM blocked_user WHERE(userby= ${get_chat_data.userid} and userto=user_id) and status=1) as blockstatus  from (SELECT *,CASE WHEN userid = ${get_chat_data.userid} THEN user2id WHEN user2id = ${get_chat_data.userid} THEN userid  END AS user_id,(SELECT message FROM chat where id=last_msg_id and deleted_id!=${get_chat_data.userid}) as lastMessage ,(SELECT username FROM users where id=user_id) as userName,(SELECT status FROM online_user where userid=user_id) as onlinestatus, ifnull((SELECT profile_image FROM users where id=user_id),'') as userImage,(SELECT  created_at  FROM chat where id=last_msg_id) as created_att ,(SELECT  msg_type  FROM chat where id=last_msg_id) as msg_type from constant where (userid=${get_chat_data.userid} or user2id=${get_chat_data.userid}))tt where deleted_id!=${get_chat_data.userid}`,
    {

        model: chat,
        model: constant,
        mapToModel: true,
        type: database.QueryTypes.SELECT
      })
    // console.log(get_message)
    return get_message;
  },
  get_typing_list: async function (msg) {

   let cconstant_msg = await constant.update({
    typing: msg.status
    },
      {
        where: {
          [Op.or]: [
            { userid: msg.userid, user2Id: msg.user2Id },
            { userid: msg.user2Id, user2Id: msg.userid }
          ]
        }
      })
 return cconstant_msg
    
  },

  clear_chat: async function (msg) {
    var find_id = await chat.findAll({
      where: {
        deletedId: 0,
        [Op.or]: [
          { userid: msg.userid, user2Id: msg.user2Id },
          { userid: msg.user2Id, user2Id: msg.userid }
        ]
      }
    })
    if (find_id != 0) {
      var clear_msg = await chat.update({
        deletedId: msg.userid,
        readStatus: 1
      },
        {
          where: {
            [Op.or]: [
              { userid: msg.userid, user2Id: msg.user2Id },
              { userid: msg.user2Id, user2Id: msg.userid }
            ]
          }
        })
      clear_msg = await constant.update({
        deletedId: msg.userid
      },
        {
          where: {
            [Op.or]: [
              { userid: msg.userid, user2Id: msg.user2Id },
              { userid: msg.user2Id, user2Id: msg.userid }
            ]
          }
        })
    }
    else {
      const clear_msg = await chat.destroy({
        where: {
          [Op.or]: [
            { userid: msg.userid, user2Id: msg.user2Id },
            { userid: msg.user2Id, user2Id: msg.userid }
          ]
        }
      })
      clear_msg = await constant.update({
        deletedId: 0
      },
        {
          where: {
            [Op.or]: [
              { userid: msg.userid, user2Id: msg.user2Id },
              { userid: msg.user2Id, user2Id: msg.userid }
            ]
          }
        })

    }
    return clear_msg;
  },
  image_base_64: async function (get_message, extension_data) {
    var image = get_message
    var data = image.replace(/^data:image\/\w+;base64,/, '');
    var extension = extension_data;
    var filename = Math.floor(Date.now() / 1000) + '.' + extension;
    var base64Str = data;
    upload_path = path.join(__dirname, '../public/images/users' + filename);
    if (extension) {
      fs.writeFile(upload_path, base64Str, {
        encoding: 'base64'
      }, function (err) {
        if (err) {
          console.log(err)
        }
      })
    }
    return filename;
  },
  delete_msg: async function (msg) {
    var find_id = await chat.findAll({
      where: {
        deletedId: 0,
        [Op.or]: [
          { userid: msg.userid, user2Id: msg.user2Id },
          { userid: msg.user2Id, user2Id: msg.userid }
        ]
      }
    })
    if (find_id != 0) {
      var clear_msg = await chat.update({
        deletedId: msg.userid,
        readStatus: 1
      },
        {
          where: {
            [Op.or]: [
              { userid: msg.userid, user2Id: msg.user2Id },
              { userid: msg.user2Id, user2Id: msg.userid }
            ]
          }
        });
      updateconstant = await constant.update({
        deletedId: msg.userid
      },
        {
          where: {
            [Op.or]: [
              { userid: msg.userid, user2Id: msg.user2Id },
              { userid: msg.user2Id, user2Id: msg.userid }
            ]
          }
        })
    }
    else {
      const clear_msg = await chat.destroy({
        where: {
          [Op.or]: [
            { userid: msg.userid, user2Id: msg.user2Id },
            { userid: msg.user2Id, user2Id: msg.userid }
          ]
        }
      });
      updateconstant = await constant.destroy({
        where: {
          [Op.or]: [
            { userid: msg.userid, user2Id: msg.user2Id },
            { userid: msg.user2Id, user2Id: msg.userid }
          ]
        }
      });

    }
    return updateconstant;

  },
  socket_disconnect: async function (socket_id) {
    /* console.log(socket_id,"socket_id") */
    let disconnect_socket_user = await onlineUser.update({
      status: 0,
      // updated: await this.create_time_stamp()
    },
      {
        where: {
          socketId: socket_id
        }
      }
    );
    return disconnect_socket_user
  },
  get_read_unread_status: async function (get_read_status) {

    update_read_status = await chat.update({
      readStatus: 1
    },
      {
        where: {
          userid: get_read_status.user2Id,
          user2Id: get_read_status.userid
        }
      }
    );

    return update_read_status;

  },
  blockUnblock_user: async function (type) {
if(type.type==1){
  update_read_status = await blockedUser.create({
    userby:type.userid,
    userto:type.user2Id,
   // status:1
   } );

    return update_read_status;
}
else if(type.type==2){
  update_read_status = await blockedUser.destroy({
where:{
  userby:type.userid,
  userto:type.user2Id,
}
});

  return update_read_status;
}

  },
}