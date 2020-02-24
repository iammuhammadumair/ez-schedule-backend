const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const category = db.category
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');


module.exports = {

  categories: async function (req, res) {

    if (req.session && req.session.auth == true) {
      var cat_data =  await category.findAll({
          order: [
            ['id', 'DESC'],
        ],     
       });
       cat_data = cat_data.map(value => {
            return value.toJSON();
           });

      res.render('admin/categories', { sessiondata: req.session,response:cat_data, msg: req.flash('msg'),  title: 'Categories'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  addcategory: async function (req, res) {
    if (req.session && req.session.auth == true) {
    if(req.body.id=="") {
      const count = await category.count({
        where : {
          name : req.body.catname
        }
  });
 if(count > 0) {
   req.flash('msg', 'Category already Exist');
   res.redirect('/admin/categories');
   return;
 }
      const addcategory= await category.create({
              name: req.body.catname, 
         });
      req.flash('msg', 'Category Successfully Added');
      } else {
        const count = await category.count({
          where : {
            name : req.body.catname
          }
    });
   if(count > 0) {
     req.flash('msg', 'Category already Exist');
     res.redirect('/admin/categories');
     return;
   }
          let update = await category.update({
                    name:req.body.catname,
                },
               {
                where: {
                      id: req.body.id,
                }
          });
          req.flash('msg', 'Category Successfully Updated');
       }
      
      res.redirect('/admin/categories');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  delete_cate: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await category.destroy({
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
   cat_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await category.update({
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
}