const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const users = db.users
const posts = db.posts;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');

module.exports = {
  adduser: async function (req, res) {

    if (req.session && req.session.auth == true) {
        res.render('admin/adduser', { sessiondata: req.session, msg: req.flash('msg'),  title: 'User'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  createuser: async function (req, res) {
    if (req.session && req.session.auth == true) {
         image_name="";
         
        const count = await users.count({
                     where : {
                       email : req.body.email
                     }
               });
              if(count > 0) {
                req.flash('msg', 'Email already Exist');
                res.redirect('/admin/adduser');
                return;
              }
              if (req.files && req.files.image) {
              
                let image = req.files.image;
                var extension = path.extname(image.name);
                var fileimage = uuid() + extension;
                await image.mv(process.cwd() + '/public/images/users/' + fileimage, function (err) {
                if(err)
                    return res.status(500).send(err);
                });
               image_name = req.protocol + '://' + req.get('host') + '/images/users/' + fileimage;
            }
       
        var auth_create = crypto.randomBytes(20).toString('hex');
			  const password = crypto.createHash('sha1').update(req.body.password).digest('hex');

        const adduser= await users.create({
          username: req.body.name, 
          profileImage: image_name, 
           email: req.body.email, 
           password:password,
           phone:req.body.phone, 
           user_type:1,
              // dob:req.body.dob, 
              // gender:req.body.gender, 
              // city:req.body.city,
              // age:req.body.age,
              // state:req.body.state,
              // lat: req.body.lat, 
              // lng: req.body.lng,
              auth_key:auth_create
       });
       //console.log(adduser, 'yioiutr===='); return
      if(adduser){
       req.flash('msg', 'User Successfully Added');
      res.redirect('/admin/userslist');
      }
      else{
       console.log(error)
      }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  userslist : async function (req, res) {
     if (req.session && req.session.auth == true) {
      var users_data =  await users.findAll({
          attributes:['id','username','profile_image','email','status','phone',
        ],  
         where : {
                 user_type : 1
               },
          order: [
            ['id', 'DESC'],
        ],  
       });
     //console.log(users_data); return false
       users_data = users_data.map(value => 
        {
            return value.toJSON();
        });
        var data =  await users.findAll({
          attributes:['country'],
           group: ['country']

       });
       var data1 =  await users.findAll({
        attributes:['city'],
         group: ['city']

     });
       //console.log(data); return false
       res.render('admin/userslist', { sessiondata: req.session,response:users_data,data,data1, msg: req.flash('msg'),  title: 'User'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  users_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await users.update({
                status:req.body.status
            },
           {
            where: {
                  id: req.body.id,
            }
      });
      res.json(1);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  delete_user: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await users.destroy({
              where: {
                id: req.body.id
              }
            });
      res.json(1);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  viewuser: async function (req, res) {
    if (req.session && req.session.auth == true) {
        var users_data = await users.findOne({
          where: {
            id: req.query.id
          },
        });
       
        res.render('admin/edituser',
          {
            users_data: users_data,
            msg: req.flash('msg'),
            sessiondata: req.session,
            title: 'User'
          });
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   update_user: async function (req, res) {
   
    if (req.session && req.session.auth == true) {
         id=req.body.id;
        //  console.log(id);
        // //  return;
        if (req.files && req.files.image) {
              
              let image = req.files.image;
              var extension = path.extname(image.name);
              var fileimage = uuid() + extension;
              image.mv(process.cwd() + '/public/images/users/' + fileimage, function (err) {
              if(err)
                  return res.status(500).send(err);
              });
             image_name = req.protocol + '://' + req.get('host') + '/images/users/' + fileimage;
          }else{
         image_name=req.body.hiddenimage;
            
          }
          const count = await users.count({
            where : {
              email : req.body.email,
              // [Op.not]: [
              //   { id: [1,2,3] }
              // ],
              id: {
                $not: req.body.id
              }
            }
          });
      // console.log(count);
      // return;
     if(count > 0) {
       req.flash('msg', 'Email already Exist');
       res.redirect('/admin/userslist');
       return;
     }
     var updateData={
      username: req.body.name, 
      profileImage: image_name, 
      email: req.body.email, 
      phone:req.body.phone, 
    }
    if(req.body.password){
      const password = crypto.createHash('sha1').update(req.body.password).digest('hex');
      updateData.password=password;
    }
      const update_users= await users.update(updateData,
            {
            where: {
               id: req.body.id
            }

       });
      req.flash('msg', 'User Successfully Updated');
      res.redirect('/admin/userslist');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
}