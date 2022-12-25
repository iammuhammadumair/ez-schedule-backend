const db = require('../models');
const posts = db.posts;
const users = db.users;
const category = db.category;
const vote = db.votecasting;
const postsImages = db.postsImages;
const orders = db.orders;
const user = db.users;
const barber = db.barbers;
const barbers_time_slot = db.barbers_time_slot;
const services = db.services;

const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');
orders.belongsTo(user, {
  foreignKey: 'user_id',
});
orders.belongsTo(barber, {
  foreignKey: 'barber_id',
});
posts.belongsTo(users, {
  foreignKey: 'userId'
});
postsImages.belongsTo(users, {
  foreignKey: 'postId'
});
postsImages.belongsTo(vote, {
  foreignKey: 'imageId'
});
postsImages.belongsTo(posts, {
  foreignKey: 'postid'
});
module.exports={

    postslist : async function (req, res) {
        if (req.session && req.session.auth == true) {
        var all_requests = [];

          all_requests = await orders.findAll({
            // attributes :['id','user_id','status','barber_id','date'],
            include : [
            {
              model : user,
              attributes : [`id`, `username`, `profile_image`,'avg_rating'],
            },
            {
              model : barber,
              attributes : [`id`, `username`, `profile_image`,'avg_rating'],
            }

            ],
            where:{
              status:[3,4],
            },
            order: [
              ['id', 'DESC'],
            ]
          });
          // console.log(all_requests);

          // return;
          var final_sent=[];
          if(all_requests){
            for (request of all_requests) {
              if(request.dataValues.user && request.dataValues.barber){
              var slot= await barbers_time_slot.findOne({
                attributes:['slot_id','slot','start_time','end_time'],
                where:{
                  barber_id:request.dataValues.barber_id,
                  slot_id: request.dataValues.slot_id
                }
              });
              if(request.dataValues.services){
                var array_Service =  request.dataValues.services.split(',');
                all_Services=await services.findAll({
                  attributes:['id','name','price'],
                  where:{
                    id:array_Service
                   }
                 })
              }
              

              sent={}
              // sent=request;
              sent.order=request;
              sent.user=request.dataValues.user.dataValues;
              sent.barber=request.dataValues.barber.dataValues;
              delete request.dataValues.user.dataValues;
              delete request.dataValues.barber.dataValues;
              sent.slot_Detail=slot;
              sent.services_detail=all_Services;
              final_sent.push(sent);
            }

            }
          }
              // console.log(final_sent);
        
          res.render('admin/posts', { sessiondata: req.session,response:final_sent, msg: req.flash('msg'),  title: 'post'});
       } else {
         req.flash('msg', 'Please login first');
         res.redirect('/admin')
       }
     },
    post_statuschange: async function (req, res) {
      if (req.session && req.session.auth == true) {
        
        let update = await posts.update({
                  status:req.body.status
              },
             {
              where: {
                    id: req.body.id,
              }
        });
        console.log(update); return false
        res.json(1);
       } else {
        req.flash('msg', 'Please login first');
        res.redirect('/admin')
      }
    },
    delete_post: async function (req, res) {
      if (req.session && req.session.auth == true) {
        const dlt = await posts.destroy({
                where: {
                  id: req.body.id
                }
              });
              const postdelete = await postsImages.destroy({
                where: {
                  postId: req.body.id
                }
              });
        res.json(1);
       } else {
        req.flash('msg', 'Please login first');
        res.redirect('/admin')
      }
    }, 
    viewposts: async function (req, res) {
      if (req.session && req.session.auth == true) {
      let postsd= await postsImages.findAll({
        attributes:['id','images','postId',[sequelize.literal('(SELECT count(imageId) FROM votecasting WHERE postsImages.id = votecasting.imageId)'), 'Totalimages'],[sequelize.literal('(SELECT count(id) FROM votecasting WHERE postsImages.postId = votecasting.postId)'), 'Votes']],
        include:[{
          model:posts,
          attributes:['id','userId','catId','description','catId'],
          include:[{
              model:users,
              required:true,
              attributes:['id','username'],
          }]
        },
      ],
      where:{
        postId:req.query.id
      }
      });   
     
      getposts = postsd.map(value => 
        {
            return value.toJSON();
        });
        res.render('admin/viewposts', { sessiondata: req.session,response:getposts, msg: req.flash('msg'),  title: 'post'});
       } else {
        req.flash('msg', 'Please login first');
        res.redirect('/admin')
      }
    },
}