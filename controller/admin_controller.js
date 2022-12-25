const db = require('../models');

var crypto = require('crypto')
const admin = db.admin;
const users = db.users;
const barbers = db.barbers;
const posts = db.posts;
const faq = db.faq
const vote = db.votecasting;
const category = db.category
const database = require('../db/db');
const sequelize = require('sequelize');
const orders = db.orders;
const helper = require('../config/helper');


posts.belongsTo(users, {
  foreignKey: 'userId'
});
posts.belongsTo(category, {
  foreignKey: 'catId'
});

module.exports = {
    website: async function (req, res) {
    
      res.render('web/index',{ msg: req.flash('msg') });
    
    
  },
  
  get_dashboard_count: async (req, res) => {

    try {
      var getYear = new Date().getFullYear();
      var getMonth = new Date().getMonth() + 1;
      var userData = [];

      var Totalmonth = 12

      for (i = 1; i <= Totalmonth; i++) {
        if (i < 10) {
          var day = "0" + i;
        }
        else {
          day = i;
        }
        var fromDate = getYear + "-" + day + "-01";

        var endDate = getYear + "-" + day + "-30";

      user_query = await database.query("select COUNT(*) as total from users where user_type=1 and  date((`created_at`)) between '" + fromDate + "' and '" + endDate + "' and  status=1", {

        model: users,
        mapToModel: true,
        type: database.QueryTypes.SELECT
      });
        if (user_query) {
                user_query = user_query.map(value => {
                  return value.toJSON();
                 });
                }

        userData.push(user_query[0].total);
      
      }

      var responseData = { userData: userData };
      res.json(responseData);
    } catch (error) {
      helpers.error(res, error);
    }
  },
  login: async function (req, res) {
    if (req.session && req.session.auth == true) {
      res.redirect('/admin/dashboard');  
    } else {
      res.render('admin/index',{ msg: req.flash('msg') });
    }
    
  },
  dashboard: async function (req, res) {

    if (req.session && req.session.auth == true) {
        var postdetail =await posts.findAll({
          attributes:['id','userId','catId','description','createdAt',[sequelize.literal('(SELECT count(postId) FROM votecasting WHERE posts.id = votecasting.postId)'), 'userName']
          ],
         include : [{
           required:true,
           model : users,
           attributes : ['username']
      }],
      order: [
       ['id', 'desc'],
     ],
     limit:5
   });
   postdetail = postdetail.map(value => 
          {
              return value.toJSON();
          });

    var user_data =  await users.findAll({
          order: [
            ['id', 'DESC'],
        ], 
        limit:5    
       });
    user_data = user_data.map(value => {
        return value.toJSON();
    });
    
    const user_count = await users.count({
      where:{
        user_type:1,
      }
    });
    const barber = await barbers.count({ where:{
        user_type:2,
      }});
    const category_count = await category.count({});

   var orders_count = await orders.count({
           
            where:{
              status:[3,4],
            },
            order: [
              ['id', 'DESC'],
            ]
          });

    const post=await posts.count({});
	let faq_count = await database.query("select COUNT(*) as total from faq ", {
		model: faq,
        mapToModel: true,
        type: database.QueryTypes.SELECT
      });
	   if (faq_count) {
                faq_count = faq_count.map(value => {
                  return value.toJSON();
                 });
                }

     let countdata={
        user_count:user_count,
        barber:barber,
        orders_count:orders_count,
        post:post,
        postdetail:postdetail,
        newusers:user_data, 
        category:category_count ,
        faq:faq_count[0].total
     }
     
     res.render('admin/dashboard', {sessiondata: req.session,countdata: countdata, msg: req.flash('msg'),  title: 'dashboard'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  adminlogin: async function (req, res) {
    // console.log('sdsfsd');
    // return;
    const admin_password = crypto.createHash('sha1').update(req.body.password).digest('hex');
    /*console.log(req.body,"==================body")*/
         get_details= await admin.findOne({
              where:{
                email:req.body.username,
                password:admin_password,
              }
         });
        //  console.log(get_details);
        //  return;
        if(get_details){
               res.session = req.session;
                req.session.user = get_details.dataValues;
                req.session.auth = true;
                res.redirect('dashboard');   
         }else{
            req.flash('msg', 'Invalid username Or Password');
            res.redirect('/admin')
         }
  },
  logout: async function (req, res) {

    if (req.session && req.session.auth == true) {
      req.session.auth = false;

      res.redirect('/admin')
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  adminprofile: async function (req, res) {
    if (req.session && req.session.auth == true) {
      var admin_data = await admin.findOne({
        where: {
          id: 1
        },
      });
      res.render('admin/profile',
        {
          response: admin_data,
          msg: req.flash('msg'),
          sessiondata: req.session,
          title: 'profile'
        });

    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  updateadminprofile: async function( req, res) {
    old_image = req.body.hiddenimage;
     if (req.session && req.session.auth == true) {
      /*console.log(req.files,"--------------req.files");*/
          if (req.files && req.files.profieimage) {
              let profieimage = req.files.profieimage;
              image_url = req.files.profieimage.name;

              profieimage.mv(process.cwd() + '/public/images/admin/' + profieimage.name, function (err) {
              if(err)
                  return res.status(500).send(err);
              });

              old_image = image_url;
          }
      let update = await admin.update({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                image:old_image,
            },
           {
            where: {
                  id: req.body.id,
            }
      });
      if(update) {
        get_details= await admin.findOne({
              where:{
                id:req.body.id,
              }
         });
        if(get_details){
               res.session = req.session;
                req.session.user = get_details.dataValues;   
         }
        req.flash('msg', 'Profile Successfully Updated');
          res.redirect('/admin/profile')
      } else {
        req.flash('msg', 'Something wrong please try again');
        res.redirect('/admin/profile')
      }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  }, 
  updateadminpassword:async function( req, res) { 
     const newpass = crypto.createHash('sha1').update(req.body.NewPassword).digest('hex');
     let oldpass=crypto.createHash('sha1').update(req.body.oldPassword).digest('hex');
     let checkpass = await admin.findOne({
      where: {
        password: oldpass
      }
    });
    if (checkpass) {
     let update = await admin.update({
                password:newpass
            },
           {
            where: {
                  id: req.body.id,
            }
      });
     if(update) {
          req.flash('msg', 'Password Successfully Updated');
          res.redirect('/admin/profile')

     }
      } else {
        req.flash('msg', 'Current Password is not match');
        res.redirect('/admin/profile')
      }
  },
  push: async function (req, res) {
  if (req.session && req.session.auth == true) {
    // console.log(req.query.t)
    users_push = await users.findAll({
      attributes: ['id','username'],

      where: {
        status: 1,
        user_type: req.query.t,
      },
    });
    type=req.query.t;
       // res.render('admin/userslist', { sessiondata: req.session,response:users_data,data,data1, msg: req.flash('msg'),  title: 'User'});

       res.render('admin/push',
       {
        response: users_push,type,
        msg: req.flash('msg'),
        sessiondata: req.session,
        title: 'Push'
      });

     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  push_post: async function (req, res) {
    if (req.session && req.session.auth == true) {

      // console.log(req.body);
      // return;
      const push_data={}; 
      push_data.sent_to_id= req.body.persons ;
      push_data.notification_code= 1001 ;
      push_data.sent_data={};
      push_data.body=req.body.text;
      await helper.all_users_Notification(push_data);

     /* const update_users= await terms.update({
        termsContent: req.body.terms,
      },
      {
        where: {
         id: 1
       }

     });*/
      // if(update_users){
        req.flash('msg', 'Send Successfully');
        res.redirect('/admin/push?t='+req.body.user_type);
     /* }else{
        req.flash('msg', 'Something went wrong,Please try again');
        res.redirect('/admin/terms');
      }*/
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  
}