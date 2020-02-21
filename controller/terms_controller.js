const db = require('../models');
const Helper = require('../config/helper');
var crypto = require('crypto')
const terms = db.terms
const sequelize = require('sequelize');



module.exports = {

  terms: async function (req, res) {
    if (req.session && req.session.auth == true) {
      var terms_data = await terms.findOne({
        where: {
          id: 1
        },
      });
      res.render('admin/terms',
        {
          response: terms_data,
          msg: req.flash('msg'),
          sessiondata: req.session,
          title: 'Terms'
        });

    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },
   update_terms: async function (req, res) {
    if (req.session && req.session.auth == true) {
        const update_users= await terms.update({
              termsContent: req.body.terms,
            },
            {
            where: {
               id: 1
            }

       });
       if(update_users){
      req.flash('msg', 'Terms and Conditions Successfully Updated');
      res.redirect('/admin/terms');
       }else{
      req.flash('msg', 'Something went wrong,Please try again');
      res.redirect('/admin/terms');
       }
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  privacy_policy: async function (req, res) {
    if (req.session && req.session.auth == true) {
      var data = await terms.findOne({
        where: {
          id: 1
        },
      });
      res.render('admin/privacy_policy',
        {
          response: data,
          msg: req.flash('msg'),
          sessiondata: req.session,
          title: 'About'
        });

    } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }
  },

  update_policy: async function (req, res) {
    if (req.session && req.session.auth == true) {
        const update= await terms.update({
          privacyPolicy: req.body.policy,
            },
            {
            where: {
               id: 1
            }

       });
      req.flash('msg', 'Policy Successfully Updated');
      res.redirect('/admin/policy');
      } else {
      req.flash('msg', 'Please login first');
      res.redirect('/admin')
    }

  },
  
}