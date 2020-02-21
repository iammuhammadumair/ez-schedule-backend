const db = require('../models');
//const Helper = require('../config/helper');
//var crypto = require('crypto')
const faq = db.faq
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');

module.exports={
    list : async function (req, res) {
        if (req.session && req.session.auth == true) {
         var data =  await faq.findAll({
             order: [
               ['id', 'DESC'],
           ],     
          });
          data = data.map(value => 
           {
               return value.toJSON();
           });
          res.render('admin/faq_data', { sessiondata: req.session,response:data, msg: req.flash('msg'),  title: 'faq'});
       } else {
         req.flash('msg', 'Please login first');
         res.redirect('/admin')
       }
     },
    statuschange: async function (req, res) {
        if (req.session && req.session.auth == true) {
          let update = await faq.update({
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
      delete_data: async function (req, res) {
        if (req.session && req.session.auth == true) {
          const dlt = await faq.destroy({
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

      add_data: async function (req, res) {

        if (req.session && req.session.auth == true) {
            res.render('admin/addfaq', { sessiondata: req.session, msg: req.flash('msg'),  title: 'faq'});
        } else {
          req.flash('msg', 'Please login first');
          res.redirect('/admin')
        }
      },
      createdata: async function (req, res) {
        if (req.session && req.session.auth == true) { 
          const count = await faq.count({
            where : {
              questions : req.body.ques
            }
      });
     if(count > 0) {
       req.flash('msg', 'FAQ already Exist');
       res.redirect('/admin/data');
       return;
     }            
            const add= await faq.create({
                questions:req.body.ques,
                answers:req.body.ans
           });
           //console.log(adduser, 'yioiutr===='); return
          if(add){
           req.flash('msg', 'FAQ Successfully Added');
          res.redirect('/admin/data');
          }
          else{
           console.log(error)
          }
          } else {
          req.flash('msg', 'Please login first');
          res.redirect('/admin')
        }
    
      },
      viewdata: async function (req, res) {
        
        if (req.session && req.session.auth == true) {
            var datas = await faq.findOne({
              where: {
                id: req.query.id
              },
            });
          //  console.log(data,"dgrfdgrfgrgs")

            res.render('admin/editfaq',
              {
                response:datas,
                msg: req.flash('msg'),
                sessiondata: req.session,
                title: 'faq'
              });
            //  console.log(datas,"dgrfdgrfgrgs")

         } else {
          req.flash('msg', 'Please login first');
          res.redirect('/admin')
        }
      },
       update_data: async function (req, res) {
        if (req.session && req.session.auth == true) {
             id=req.body.id;    
          const update= await faq.update({
                questions:req.body.ques,
                answers:req.body.ans
                },
                {
                where: {
                   id: req.body.id
                }
    
           });
          req.flash('msg', 'FAQ Successfully Updated');
          res.redirect('/admin/data');
          } else {
          req.flash('msg', 'Please login first');
          res.redirect('/admin')
        }
    
      },
}
