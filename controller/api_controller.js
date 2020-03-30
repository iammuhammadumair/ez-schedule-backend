const db = require('../models');
const user = db.users;
const category = db.category;
const faq = db.faq
const terms = db.terms
const posts = db.posts;
const vote = db.votecasting;
const postsImages = db.postsImages;
const connection = db.connections;
var   crypto = require('crypto');
const helper = require('../config/helper');
const jsonData = require('../config/jsonData');
const sequelize = require('sequelize');
const Op = sequelize.Op;
posts.hasMany(postsImages)
module.exports = {
  resetPassword: async function (req, res) {
    try {

      const pass = crypto.createHash('sha1').update(req.body.confirm_password).digest('hex');
      const save = await user.update({
        password: pass,
        forgotPassword: '',
      },
        {
          where: {
            forgotPassword: req.body.hash
          }
        }
      );
      if (save) {
        res.render('success_page', { msg: "Password Changed successfully" });
      } else {
        res.render('success_page', { msg: "Invalid user" });
      }

    } catch (errr) {
      throw errr
    }

  },
  url_id: async function (req, res) {
    try {
      //  console.log(req.params.id, "=================req.params.id");
      const data = await user.findOne({
        attributes: ['forgotPassword'],
        where: {
          forgotPassword: req.params.id,
        }
      });

      if (data) {
        // console.log(data.length); return false;
        res.render("reset_password", {
          title: "instadate",
          response: data.dataValues.forgot_password,
          flash: "",
          hash: req.params.id
        });
      } else {
        res.status(403).send("Link has been expired!");
      }

    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  forgot_password: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        email: req.body.email
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const data = await user.findOne({
        where: {
          email: requestdata.email
        }
      });
      if (data) {
        let otp = crypto.randomBytes(20).toString('hex');
        helper.send_emails(otp, data);
        const save = await user.update({
          forgotPassword: otp
        },
          {
            where: {
              id: data.dataValues.id
            }
          }
        );
        let msg = 'Email sent successfully';
        var body = {}
        jsonData.true_status(res, body, msg)

      } else {
        let msg = 'Email does not exist';
        jsonData.wrong_status(res, msg)
      }
    }
    catch (errr) {
      jsonData.wrong_status(res, errr)

    }

  },
  login: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        email: req.body.email,
        password: req.body.password
      };
      const non_required = {
        device_type: req.body.device_type,
        device_token: req.body.device_token
      };
      let requestdata = await helper.vaildObject(required, non_required, res);
      const password = crypto.createHash('sha1').update(requestdata.password).digest('hex');
      const user_data = await user.findOne({
        where: {
          email: requestdata.email,
          password: password
        }
      });
      if (user_data) {
        var auth_create = crypto.randomBytes(20).toString('hex');
        const update_details = await user.update({
          authKey: auth_create,
          deviceType: requestdata.device_type,
          deviceToken: requestdata.device_token
        },
          {
            where: {
              email: requestdata.email,
            }
          }
        );
        let data = await helper.userdetail(user_data.dataValues.id);
        let msg = 'User Logged In successfully';
        jsonData.true_status(res, data, msg)

      }
      else {
        let msg = 'Incorrect Email or Password';
        jsonData.wrong_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  logout: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        auth_key: req.headers.auth_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const user_data = await user.findOne({
        where: {
          authKey: requestdata.auth_key
        }
      });
      if (user_data) {
        const detail_data = await user.update({
          authKey: '',
          deviceToken: ''
        },
          {
            where:
            {
              id: user_data.dataValues.id
            }
          });
        let msg = 'Logout Successfully';
        let data = {};
        jsonData.true_status(res, data, msg)
      }
      else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  sign_up: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        country: req.body.country,
        dob: req.body.dob,
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender,
        age: req.body.age,
      };
      const non_required = {
        device_type: req.body.device_type,
        device_token: req.body.device_token,
        profile_image: req.body.profile_image,
      };
      let requestdata = await helper.vaildObject(required, non_required, res);
      const user_data = await user.findOne({
        where: {
          email: requestdata.email,
        }
      });
      if (user_data) {
        let msg = 'Email already exist';
        jsonData.wrong_status(res, msg)
      } else {
        const password = crypto.createHash('sha1').update(requestdata.password).digest('hex');
        var auth_create = crypto.randomBytes(20).toString('hex');
        imageName = '';
        if (req.files && req.files.profile_image) {
          imageName = helper.image_upload(req.files.profile_image);
        }
        const create_user = await user.create({
          username: requestdata.name,
          email: requestdata.email,
          password: password,
          profileImage: imageName,
          country: requestdata.country,
          dob: requestdata.dob,
          gender: requestdata.gender,
          state: requestdata.state,
          city: requestdata.city,
          age: requestdata.age,
          authKey: auth_create,
          deviceType: requestdata.device_type,
          deviceToken: requestdata.device_token,
        });

        if (create_user) {
          let data = await helper.userdetail(create_user.dataValues.id);
          let msg = 'Registered successfully';
          jsonData.true_status(res, data, msg)
        } else {
          let msg = 'Try again Sometime';
          jsonData.invalid_status(res, msg)
        }
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  editprofile: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        auth_key: req.headers.auth_key,
        name: req.body.name,
        email: req.body.email,
        country: req.body.country,
        dob: req.body.dob,
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender,
        age: req.body.age,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const user_data = await user.findOne({
        where: {
          authKey: requestdata.auth_key
        }
      });
      if (user_data) {
        let imageName = user_data.dataValues.profileImage;
        let userid = user_data.dataValues.id;
        if (req.files && req.files.profile_image) {
          imageName = helper.image_upload(req.files.profile_image);
        }
        const detail_data = await user.update({
          username: requestdata.name,
          email: requestdata.email,
          profileImage: imageName,
          country: requestdata.country,
          dob: requestdata.dob,
          gender: requestdata.gender,
          state: requestdata.state,
          city: requestdata.city,
          age: requestdata.age,
        },
          {
            where:
            {
              id: userid
            }
          });
        let msg = 'Updated Successfully';
        let data = await helper.userdetail(userid);
        jsonData.true_status(res, data, msg)
      }
      else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  social_login: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        social_id: req.body.social_id,
        loginType: req.body.loginType,

      };
      const non_required = {
        name: req.body.name,
        email: req.body.email,
        profileimage: req.body.profile_image,
        age: req.body.age,
        country: req.body.country,
        dob: req.body.dob,
        city: req.body.city,
        gender: req.body.gender,
        state: req.body.state,
        loginType: req.body.loginType,
        device_type: req.body.device_type,
        device_token: req.body.device_token,
      };

      let requestdata = await helper.vaildObject(required, non_required, res);

      const social_data = await user.findOne({
        where: {
          socialId: requestdata.social_id,

        }
      });
      if (social_data) {
        var auth_create = crypto.randomBytes(80).toString('hex');
        const update_details = await user.update({
          loginType: requestdata.loginType,
          authKey: auth_create,
          deviceType: requestdata.device_type,
          deviceToken: requestdata.device_token
        },
          {
            where: {
              socialId: requestdata.social_id,
            }
          }
        );
        let data2 = await helper.userdetail(social_data.dataValues.id);
        let msg = 'Login successfully';
        jsonData.true_status(res, data2, msg)

      } else {
        var auth_create = crypto.randomBytes(80).toString('hex');
        const create_user = await user.create({
          username: requestdata.name,
          email: requestdata.email,
          age: requestdata.age,
          country: requestdata.country,
          dob: requestdata.dob,
          city: requestdata.city,
          gender: requestdata.gender,
          state: requestdata.state,
          profileImage: requestdata.profileimage,
          socialId: requestdata.social_id,
          loginType: requestdata.loginType,
          authKey: auth_create,
          deviceType: requestdata.device_type,
          deviceToken: requestdata.device_token,
        });
        if (create_user) {
          let data2 = await helper.userdetail(create_user.dataValues.id);
          let msg = 'Registered successfully';
          jsonData.true_status(res, data2, msg)
        } else {
          let msg = 'Try again Sometime';
          jsonData.invalid_status(res, msg)
        }

      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  getcategorylist: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const userdata = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });
      if (userdata) {
        const categorydata = await category.findAll({
          attributes: [`id`, `name`],
          where: {
            status: 1,
          }
        });
        let msg = 'Category list';
        jsonData.true_status(res, categorydata, msg)
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  getfaqlist: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);

      const faqdata = await faq.findAll({
        attributes: [`id`, `questions`, `answers`],
        where: {
          status: 1,
        }
      });
      let msg = 'faq list';
      jsonData.true_status(res, faqdata, msg)

    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  getcontent: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);

      const Contentdata = await terms.findOne({
        attributes: [`termsContent`, `privacyPolicy`],
        where: {
          status: 1,
        }
      });
      var ttt = Contentdata.dataValues.privacyPolicy.replace(/(\r\n|\n|\r|\t)/gm, "");
      var ttt2 = Contentdata.dataValues.termsContent.replace(/(\r\n|\n|\r|\t)/gm, "");
      Contentdata.dataValues.privacyPolicy = ttt
      Contentdata.dataValues.termsContent = ttt2

      let msg = 'Content';
      jsonData.true_status(res, Contentdata, msg)

    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  ChangePassword: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
        old_password: req.body.old_password,
        new_password: req.body.new_password
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      const data = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });

      if (data) {
        const password = crypto.createHash('sha1').update(requestdata.old_password).digest('hex');
        const data2 = await user.findOne({
          where: {
            password: password,
            authKey: requestdata.authKey,
          }
        });
        if (data2) {
          const new_password = crypto.createHash('sha1').update(requestdata.new_password).digest('hex');
          const save = await user.update({
            password: new_password,
          }, {
            where: {
              id: data.dataValues.id
            }
          });
          let msg = 'Password Changed Successfully';
          var save_data = {};
          jsonData.true_status(res, save_data, msg);
        } else {
          let msg = 'Current password does not matched';
          jsonData.wrong_status(res, msg)
        }
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    } catch (errr) {
      jsonData.wrong_status(res, errr)
    }
  },
  changenotistatus: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
        status: req.body.status,   /// 1= on , 2= off
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      const data = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });

      if (data) {
        const save = await user.update({
          notificationStatus: requestdata.status,
        }, {
          where: {
            id: data.dataValues.id
          }
        });
        let msg = "";
        if (requestdata.status == 1) {
          msg = 'Notification On';
        } else {
          msg = 'Notification Off';
        }

        var save_data = {
          status: requestdata.status
        };
        jsonData.true_status(res, save_data, msg);

      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    } catch (errr) {
      jsonData.wrong_status(res, errr)
    }
  },
  createpost: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
        categoryId: req.body.categoryId,
        description: req.body.description,
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      const data = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });

      if (data) {
        let userid = data.dataValues.id;
        const save = await posts.create({
          userId: userid,
          catId: requestdata.categoryId,
          description: requestdata.description,
        });
        if (save) {
          var Imagesd ;
          let insertImage ="";
          let postid = save.dataValues.id;
          if (req.files && req.files.image) {
              let getFiles = req.files;
              if (Array.isArray(getFiles.image)) {
                for (var i in getFiles.image) {
                  Imagesd = helper.image_upload_post(getFiles.image[i]);
                   insertImage = await postsImages.create({
                    postId: postid,
                    images: Imagesd
                  }); 
                }
              } else {
              Imagesd = helper.image_upload_post(getFiles.image);
                insertImage = await postsImages.create({
                  postId: postid,
                  images: Imagesd
                }); 
              }
        }
        let response = await helper.postdetail(userid, postid, res);
          let msg = 'Post Sucessfully Created';
          jsonData.true_status(res, response, msg);
        } else {
          let msg = 'Try Again Somthing Wrong';
          jsonData.true_status(res, msg);
        }


      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    } catch (errr) {
      console.log(errr,"--------------------errr-----------");
      jsonData.wrong_status(res, errr)
    }
  },
  homepagepostlist: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
        categoryId: req.body.categoryId, 
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      const data = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });

      if (data) {
        let userid = data.dataValues.id;
       
        const postdata = await posts.findAll({
          attributes:[`id`, `userId`, `catId`, `description`, `status`, 
          [sequelize.literal('UNIX_TIMESTAMP(posts.createdAt)'), 'createdAt'],
          [sequelize.literal('(SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)'), 'totalvote'],
          [sequelize.literal('(SELECT case when `profile_image`="" then "" else  CONCAT("http://'+req.get('host')+'/images/users/", profile_image) end as userimage FROM users where id = posts.userId)'), 'userimage'],
          [sequelize.literal('(SELECT username FROM users where id = posts.userId)'), 'username'],
          [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `postId`=posts.id and userId='+userid+')'), 'is_vote'],
        ],
          where: {
            status: 1,
            catId:requestdata.categoryId,
          },
          include:[{
            model: postsImages,
            attributes: ['id',
            [sequelize.literal('case when postsImages.`images`="" then "" else  CONCAT("http://'+req.get('host')+'/images/post/", postsImages.images) end'), 'images'],
            [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `imageId`=postsImages.id and userId='+userid+')'), 'is_imagevote'], 
            [sequelize.literal('(SELECT  ifnull(count(*),0) as count FROM `votecasting` WHERE `imageId`=postsImages.id)'), 'imagevote'], 
            [sequelize.literal('(SELECT ifnull(round((((SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `imageId`=postsImages.id) / (SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)) * 100),2),0) )'), 'percentage'],            
          ],
            on: {
              col1: sequelize.where(sequelize.col('postsImages.postId'), '=', sequelize.col('posts.id')),
            },
          }],
        });
        if (postdata) {
          let msg = 'Post List';
          jsonData.true_status(res, postdata, msg);
        } else {
          let msg = 'Try Again Somthing Wrong';
          jsonData.true_status(res, msg);
        }


      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    } catch (errr) {
      console.log(errr,"--------------------errr-----------");
      jsonData.wrong_status(res, errr)
    }
  },
  userlist: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const userdata = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });
      if (userdata) {
        let userid =userdata.dataValues.id;
        const user_data = await user.findAll({
          attributes: [`id`, `username`,'profile_image',
          [sequelize.literal('(SELECT case when ifnull(count(*),0)= 0 then 0 else 1 end FROM `connections` WHERE `senderId`='+userid+')'), 'is_following'], 
          [sequelize.literal('(SELECT case when ifnull(count(*),0)= 0 then 0 else 1 end  FROM `connections` WHERE `receiverId`='+userid+')'), 'is_followers'], 
        ],
          where: {
            [Op.and]: [
              sequelize.literal('status=1'),
              sequelize.literal('id!='+userid),
          ]
          }
        });
        let msg = 'User list';
        jsonData.true_status(res, user_data, msg)
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  myprofile: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const userdata = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });
      if (userdata) {
        let userid =userdata.dataValues.id;
        let user_data = await user.findOne({
          attributes: [`id`, `username`, `profile_image`, `phone`, `email`, `Country`, `dob`, `gender`, `state`, `city`, `age`, `notification_status`, `lat`, `lng`, `loginType`, `auth_key`, `device_type`, `device_token`, `socialId`,
          [sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `senderId`='+userid+')'), 'following'], 
          [sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `receiverId`='+userid+')'), 'followers'], 
          [sequelize.literal('(SELECT ifnull(count(*),0) FROM `posts` WHERE status=1 and `userId`='+userid+')'), 'postcount'], 
        ],
          where: {
            [Op.and]: [
              sequelize.literal('status=1'),
              sequelize.literal('id='+userid),
          ]
          }
        });
        let postdata = await posts.findAll({
          attributes:[`id`, `userId`, `catId`, `description`, `status`, 
          [sequelize.literal('UNIX_TIMESTAMP(posts.createdAt)'), 'createdAt'],
          [sequelize.literal('(SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)'), 'totalvote'],
          [sequelize.literal('(SELECT case when `profile_image`="" then "" else  CONCAT("http://'+req.get('host')+'/images/users/", profile_image) end as userimage FROM users where id = posts.userId)'), 'userimage'],
          [sequelize.literal('(SELECT username FROM users where id = posts.userId)'), 'username'],
          [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `postId`=posts.id and userId='+userid+')'), 'is_vote'],
        ],
          where: {
            status: 1,
            userId:userid,
          },
          include:[{
            model: postsImages,
            attributes: ['id',
            [sequelize.literal('case when postsImages.`images`="" then "" else  CONCAT("http://'+req.get('host')+'/images/post/", postsImages.images) end'), 'images'],
            [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `imageId`=postsImages.id and userId='+userid+')'), 'is_imagevote'], 
            [sequelize.literal('(SELECT  ifnull(count(*),0) as count FROM `votecasting` WHERE `imageId`=postsImages.id)'), 'imagevote'], 
            [sequelize.literal('(SELECT ifnull(round((((SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `imageId`=postsImages.id) / (SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)) * 100),2),0) )'), 'percentage'],            
          ],
            on: {
              col1: sequelize.where(sequelize.col('postsImages.postId'), '=', sequelize.col('posts.id')),
            },
          }],
        });
        let finaldata ={
          userdetail:user_data,
          postdata:postdata
        }
        let msg = 'My profile';
        jsonData.true_status(res, finaldata, msg)
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  otheruserprofile: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
        userid: req.query.userid,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      let userid =requestdata.userid
      const userdata = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });
      if (userdata) {
        let loginuserid =userdata.dataValues.id
        let user_data = await user.findOne({
          attributes: [`id`, `username`, `profile_image`, `phone`, `email`, `Country`, `dob`, `gender`, `state`, `city`, `age`, `notification_status`, `lat`, `lng`, `loginType`, `auth_key`, `device_type`, `device_token`, `socialId`,
          [sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `senderId`='+userid+')'), 'following'], 
          [sequelize.literal('(SELECT case when ifnull(count(*),0)=0 then 0 else 1 end FROM `connections` WHERE `senderId`='+userid+' and `receiverId`='+loginuserid+' )'), 'is_following'], 
          [sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `receiverId`='+userid+')'), 'followers'], 
          [sequelize.literal('(SELECT case when ifnull(count(*),0)=0 then 0 else 1 end FROM `connections` WHERE `receiverId`='+userid+' and `senderId`='+loginuserid+' )'), 'is_followers'], 
          [sequelize.literal('(SELECT ifnull(count(*),0) FROM `posts` WHERE status=1 and `userId`='+userid+')'), 'postcount'], 
        ],
          where: {
            [Op.and]: [
              sequelize.literal('status=1'),
              sequelize.literal('id='+userid),
          ]
          }
        });
        let postdata = await posts.findAll({
          attributes:[`id`, `userId`, `catId`, `description`, `status`, 
          [sequelize.literal('UNIX_TIMESTAMP(posts.createdAt)'), 'createdAt'],
          [sequelize.literal('(SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)'), 'totalvote'],
          [sequelize.literal('(SELECT case when `profile_image`="" then "" else  CONCAT("http://'+req.get('host')+'/images/users/", profile_image) end as userimage FROM users where id = posts.userId)'), 'userimage'],
          [sequelize.literal('(SELECT username FROM users where id = posts.userId)'), 'username'],
          [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `postId`=posts.id and userId='+loginuserid+')'), 'is_vote'],
        ],
          where: {
            status: 1,
            userId:userid,
          },
          include:[{
            model: postsImages,
            attributes: ['id',
            [sequelize.literal('case when postsImages.`images`="" then "" else  CONCAT("http://'+req.get('host')+'/images/post/", postsImages.images) end'), 'images'],
            [sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `imageId`=postsImages.id and userId='+loginuserid+')'), 'is_imagevote'], 
            [sequelize.literal('(SELECT  ifnull(count(*),0) as count FROM `votecasting` WHERE `imageId`=postsImages.id)'), 'imagevote'], 
            [sequelize.literal('(SELECT ifnull(round((((SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `imageId`=postsImages.id) / (SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)) * 100),2),0) )'), 'percentage'],            
          ],
            on: {
              col1: sequelize.where(sequelize.col('postsImages.postId'), '=', sequelize.col('posts.id')),
            },
          }],
        });
        let finaldata ={
          userdetail:user_data,
          postdata:postdata
        }
        let msg = 'Other User profile';
        jsonData.true_status(res, finaldata, msg)
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  followerslist: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const userdata = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });
      if (userdata) {
        let userid =userdata.dataValues.id;
        var getfollowerslist  = await user.sequelize.query('select id,username,profile_image from users where id in (SELECT senderId FROM `connections` WHERE `receiverId`='+userid+')',{
          type: sequelize.QueryTypes.SELECT
        });
  
        let msg = 'Followers User list';
        jsonData.true_status(res, getfollowerslist, msg)
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  followinglist: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        authKey: req.headers.auth_key,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const userdata = await user.findOne({
        where: {
          authKey: requestdata.authKey,
        }
      });
      if (userdata) {
        let userid =userdata.dataValues.id;
        var getfollowinglist  = await user.sequelize.query('select id,username,profile_image from users where id in (SELECT receiverId FROM `connections` WHERE `senderId`='+userid+')',{
          type: sequelize.QueryTypes.SELECT
        });
  
        let msg = 'Following User list';
        jsonData.true_status(res, getfollowinglist, msg)
      } else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
  follow: async function (req, res) {
    try {
      const required = {
        security_key: req.headers.security_key,
        auth_key: req.headers.auth_key,
        otheruserid: req.body.otheruserid,
      };
      const non_required = {};
      let requestdata = await helper.vaildObject(required, non_required, res);
      const user_data = await user.findOne({
        where: {
          authKey: requestdata.auth_key
        }
      });
      if (user_data) {
        let userid =user_data.dataValues.id;
        const create_follow= await connection.create({
          senderId: userid, 
          receiverId : requestdata.otheruserid
        });

        let msg = 'follow Successfully';
        jsonData.true_status(res, create_follow, msg)
      }
      else {
        let msg = 'Invalid authorization key';
        jsonData.invalid_status(res, msg)
      }
    }
    catch (error) {
      jsonData.wrong_status(res, error)
    }
  },
}