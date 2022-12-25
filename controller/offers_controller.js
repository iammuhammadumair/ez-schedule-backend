const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const offers = db.offers
const posts = db.posts;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');

module.exports = {
  addoffer: async function (req, res) {

    if (req.session && req.session.auth == true) {
        res.render('admin/addoffer', { sessiondata: req.session, msg: req.flash('msg'),  title: 'offer'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  createoffer: async function (req, res) {
    if (req.session && req.session.auth == true) {
         image_name="";
         
            if (req.files && req.files.image) {
              
                let image = req.files.image;
                var extension = path.extname(image.name);
                var fileimage = uuid() + extension;
                await image.mv(process.cwd() + '/public/images/offers/' + fileimage, function (err) {
                if(err)
                    return res.status(500).send(err);
                });
               image_name = req.protocol + '://' + req.get('host') + '/images/offers/' + fileimage;
               req.body.image=req.body.image_name;
            }
        var save_data=req.body;

            if(image_name){
              save_data.image=image_name;
            }
        // console.log()


        const addoffer= await offers.create(save_data);
       //console.log(addoffer, 'yioiutr===='); return
      if(addoffer){
       req.flash('msg', 'Offer Successfully Added');
      res.redirect('/admin/offerslist');
      }
      else{
       console.log(error)
      }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  offerslist : async function (req, res) {
     if (req.session && req.session.auth == true) {
      var offers_data =  await offers.findAll({
          // attributes:['id','offername','profile_image','email','status','phone',],  
         where : {
                 // offer_type : 1
               },
          order: [
            ['id', 'DESC'],
        ],  
       });
     //console.log(offers_data); return false
       offers_data = offers_data.map(value => 
        {
            return value.toJSON();
        });
       data=[];
       data1=[];
      /*  var data =  await offers.findAll({
          attributes:['country'],
           group: ['country']

       });
       var data1 =  await offers.findAll({
        attributes:['city'],
         group: ['city']

     });*/
       //console.log(data); return false
       res.render('admin/offerslist', { sessiondata: req.session,response:offers_data,data,data1, msg: req.flash('msg'),  title: 'offer'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  offers_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await offers.update({
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
  delete_offer: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await offers.destroy({
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
  viewoffer: async function (req, res) {
    if (req.session && req.session.auth == true) {
        var offers_data = await offers.findOne({
          where: {
            id: req.query.id
          },
        });
       
        res.render('admin/editoffer',
          {
            offers_data: offers_data,
            msg: req.flash('msg'),
            sessiondata: req.session,
            title: 'offer'
          });
        console.log(offers_data);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   update_offer: async function (req, res) {
   
    if (req.session && req.session.auth == true) {
         image_name=req.body.hiddenimage;
         id=req.body.id;
        //  console.log(id);
        // //  return;
          var save_data=req.body;
        
        if (req.files && req.files.image) {
              
              let image = req.files.image;
              var extension = path.extname(image.name);
              var fileimage = uuid() + extension;
              image.mv(process.cwd() + '/public/images/offers/' + fileimage, function (err) {
              if(err)
                  return res.status(500).send(err);
              });
             image_name = req.protocol + '://' + req.get('host') + '/images/offers/' +fileimage;
          }

            if(image_name){
              save_data.image=image_name;
            }
     
  
      const update_offers= await offers.update(
              save_data, 
              {
                where: {
               id: req.body.id
                }
              }           
              

       );
      req.flash('msg', 'offer Successfully Updated');
      res.redirect('/admin/offerslist');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
}