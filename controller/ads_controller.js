const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const ads = db.ads
const posts = db.posts;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');

module.exports = {
  addad: async function (req, res) {

    if (req.session && req.session.auth == true) {
        res.render('admin/addad', { sessiondata: req.session, msg: req.flash('msg'),  title: 'ad'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  createad: async function (req, res) {
    if (req.session && req.session.auth == true) {
         image_name="";
         
            if (req.files && req.files.image) {
              
                let image = req.files.image;
                var extension = path.extname(image.name);
                var fileimage = uuid() + extension;
                await image.mv(process.cwd() + '/public/images/ads/' + fileimage, function (err) {
                if(err)
                    return res.status(500).send(err);
                });
               image_name = req.protocol + '://' + req.get('host') + '/images/ads/' + fileimage;
               req.body.image=req.body.image_name;
            }
        var save_data=req.body;

            if(image_name){
              save_data.image=image_name;
            }
        // console.log()


        const addad= await ads.create(save_data);
       //console.log(addad, 'yioiutr===='); return
      if(addad){
       req.flash('msg', 'Ad Successfully Added');
      res.redirect('/admin/adslist');
      }
      else{
       console.log(error)
      }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  adslist : async function (req, res) {
     if (req.session && req.session.auth == true) {
      var ads_data =  await ads.findAll({
          // attributes:['id','adname','profile_image','email','status','phone',],  
         where : {
                 // ad_type : 1
               },
          order: [
            ['id', 'DESC'],
        ],  
       });
     //console.log(ads_data); return false
       ads_data = ads_data.map(value => 
        {
            return value.toJSON();
        });
       data=[];
       data1=[];
      /*  var data =  await ads.findAll({
          attributes:['country'],
           group: ['country']

       });
       var data1 =  await ads.findAll({
        attributes:['city'],
         group: ['city']

     });*/
       //console.log(data); return false
       res.render('admin/adslist', { sessiondata: req.session,response:ads_data,data,data1, msg: req.flash('msg'),  title: 'ad'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  ads_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await ads.update({
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
  delete_ad: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await ads.destroy({
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
  viewad: async function (req, res) {
    if (req.session && req.session.auth == true) {
        var ads_data = await ads.findOne({
          where: {
            id: req.query.id
          },
        });
       
        res.render('admin/editads',
          {
            ads_data: ads_data,
            msg: req.flash('msg'),
            sessiondata: req.session,
            title: 'ad'
          });
        console.log(ads_data);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   update_ad: async function (req, res) {
   
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
              image.mv(process.cwd() + '/public/images/ads/' + fileimage, function (err) {
              if(err)
                  return res.status(500).send(err);
              });
             image_name = req.protocol + '://' + req.get('host') + '/images/ads/' +fileimage;
          }

            if(image_name){
              save_data.image=image_name;
            }
     
  
      const update_ads= await ads.update(
              save_data, 
              {
                where: {
               id: req.body.id
                }
              }           
              

       );
      req.flash('msg', 'Ads Successfully Updated');
      res.redirect('/admin/adslist');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
}