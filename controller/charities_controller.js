const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const charities = db.charities
const charity_payment_m = db.charity_payment
const user = db.users
const posts = db.posts;
const sequelize = require('sequelize');
var path = require('path');
var uuid = require('uuid');
const Op = sequelize.Op;

charity_payment_m.belongsTo(user, {
  foreignKey: 'user_id',
});
charity_payment_m.belongsTo(charities, {
  foreignKey: 'charity_id',
});

module.exports = {
  add_charity: async function (req, res) {

    if (req.session && req.session.auth == true) {
        res.render('admin/add_charity', { sessiondata: req.session, msg: req.flash('msg'),  title: 'Charity'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  createcharity: async function (req, res) {
    if (req.session && req.session.auth == true) {
         image_name="";
         
        
              if (req.files && req.files.image) {
              
                let image = req.files.image;
                var extension = path.extname(image.name);
                var fileimage = uuid() + extension;
                await image.mv(process.cwd() + '/public/images/charities/' + fileimage, function (err) {
                if(err)
                    return res.status(500).send(err);
                });
               image_name = req.protocol + '://' + req.get('host') + '/images/charities/' +fileimage;
            }
       
        const add_charity= await charities.create({
          name: req.body.name, 
          image: image_name, 
           description: req.body.description, 
           square_account:req.body.square_account,
           // amount:req.body.amount, 
           status:0, 

              // dob:req.body.dob, 
              // gender:req.body.gender, 
              // city:req.body.city,
              // age:req.body.age,
              // state:req.body.state,
              // lat: req.body.lat, 
              // lng: req.body.lng,
       });
       //console.log(add_charity, 'yioiutr===='); return
      if(add_charity){
       req.flash('msg', 'charity Successfully Added');
       res.redirect('/admin/charities');
      }
      else{
       console.log(error)
      }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  charitieslist : async function (req, res) {
     if (req.session && req.session.auth == true) {
        var charities_data =  await charities.findAll({  
       });
    //  console.log(charities_data); return false
       charities_data = charities_data.map(value => 
        {
            return value.toJSON();
        });
        data=[];
       data1=[];
       //console.log(data); return false
       res.render('admin/charities', { sessiondata: req.session,response:charities_data,data,data1, msg: req.flash('msg'),  title: 'Charity'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   charity_payment : async function (req, res) {
     if (req.session && req.session.auth == true) {
        var charities_data =  await charity_payment_m.findAll({
           include : [
            {
              model : user,
              attributes : [`id`, `username`, `profile_image`],
            },
            {
              model : charities,
              attributes : [`id`, `name`],
            }
            ],
        });
     // console.log(charities_data[0].user.); return false
       
        data=[];
       data1=[];
       //console.log(data); return false
       res.render('admin/charity_payment', { sessiondata: req.session,response:charities_data,data,data1, msg: req.flash('msg'),  title: 'Charity Payments'});
    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  charities_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await charities.update({
                status:req.body.status
            },
           {
            where: {
                  id: req.body.id,
            }
      });
      var update_status = await charities.update({
                status:0
            },
            {
            where: {
             [Op.not]: [
                    {id :req.body.id}
             ]
            }
      });
      res.json(1);
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
  delete_charity: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await charities.destroy({
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
  viewcharity: async function (req, res) {
    if (req.session && req.session.auth == true) {
        var charities_data = await charities.findOne({
          where: {
            id: req.query.id
          },
        });
       
        res.render('admin/viewcharity',
          {
            charities_data: charities_data,
            msg: req.flash('msg'),
            sessiondata: req.session,
            title: 'Charity'
          });
     } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   updatecharity: async function (req, res) {
   
    if (req.session && req.session.auth == true) {
         image_name=req.body.hiddenimage;
         id=req.body.id;
        //  console.log(id);
        // //  return;
        if (req.files && req.files.image) {
              
              let image = req.files.image;
              var extension = path.extname(image.name);
              var fileimage = uuid() + extension;
              await image.mv(process.cwd() + '/public/images/charities/' + fileimage, function (err) {
              if(err)
                  return res.status(500).send(err);
              });
             image_name = req.protocol + '://' + req.get('host') + '/images/charities/' +fileimage;
          }
         
      const update_charities= await charities.update({
              name: req.body.name, 
              image: image_name, 
              description: req.body.description, 
              square_account:req.body.square_account,
              // amount:req.body.amount, 
         
            },
            {
            where: {
               id: req.body.id
            }

       });
      req.flash('msg', 'Charity Successfully Updated');
      res.redirect('/admin/charities');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
}