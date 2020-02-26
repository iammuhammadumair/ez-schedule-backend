const db = require('../models');
const posts = db.posts;
const users = db.users;
const category = db.category;
const vote = db.votecasting;
const postsImages = db.postsImages;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');
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
         var post =  await posts.findAll({
           attributes:['id','userId','catId','description','status',[sequelize.literal('(SELECT count(postId) FROM votecasting WHERE posts.id = votecasting.postId)'), 'Totalvotes']
           ],
          include : [{
            required:true,
            model : users,
            attributes : ['username'],
       }],
       order: [
        ['id', 'desc'],
      ]
    });
          post = post.map(value => 
           {
               return value.toJSON();
           });
       
          res.render('admin/posts', { sessiondata: req.session,response:post, msg: req.flash('msg'),  title: 'post'});
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