const db = require('../models');
const posts = db.posts;
const users = db.users;
const category = db.category;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');

posts.belongsTo(users, {
  foreignKey: 'userId'
});
posts.belongsTo(category, {
  foreignKey: 'catId'
});
module.exports={

    postslist : async function (req, res) {
        if (req.session && req.session.auth == true) {
         var post =  await posts.findAll({
          include : [{
            required:true,
            model : users,
            attributes : ['username']
       },
       {
            required:true,
            model : category,
            attributes : ['name']
       }], 
      where: {
        id: req.query.id
      }, 
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
    delete_post: async function (req, res) {
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

}