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
            model : users,
            attributes : ['username']
       },
       {
            model : category,
            attributes : ['']
       }], 
      where: {
        id: req.query.id
      }, 
          });
          post = post.map(value => 
           {
               return value.toJSON();
           });
          res.render('admin/', { sessiondata: req.session,response:post, msg: req.flash('msg'),  title: 'post'});
       } else {
         req.flash('msg', 'Please login first');
         res.redirect('/admin')
       }
     },

}