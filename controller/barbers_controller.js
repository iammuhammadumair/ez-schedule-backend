const db = require("../models");
const Helper = require("../config/helper");
var crypto = require("crypto");
const users = db.barbers;
const posts = db.posts;
const sequelize = require("sequelize");
var path = require("path");
var uuid = require("uuid");
const moment = require('moment'); // require
const barbers_time_slot = db.barbers_time_slot;

module.exports = {
  adduser: async function (req, res) {
    if (req.session && req.session.auth == true) {
      res.render("admin/adduser_b", {
        sessiondata: req.session,
        msg: req.flash("msg"),
        title: "Barber",
      });
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
  createuser: async function (req, res) {
    if (req.session && req.session.auth == true) {
      image_name = "";

      const count = await users.count({
        where: {
          email: req.body.email,
        },
      });
      if (count > 0) {
        req.flash("msg", "Email already Exist");
        res.redirect("/admin/adduser_b");
        return;
      }
      if (req.files && req.files.image) {
        let image = req.files.image;
        var extension = path.extname(image.name);
        var fileimage = uuid() + extension;
        await image.mv(
          process.cwd() + "/public/images/users/" + fileimage,
          function (err) {
            if (err) return res.status(500).send(err);
          }
        );
        image_name =
          req.protocol + "://" + req.get("host") + "/images/users/" + fileimage;
      }
			const password = crypto.createHash('sha1').update(req.body.password).digest('hex');

      var auth_create = crypto.randomBytes(20).toString("hex");
      var schedules=[{"day":1,"open_time":"10:00","close_time":"20:00","is_close":"0"}, {"day":2,"open_time":"10:00","close_time":"20:00","is_close":"0"}, {"day":3,"open_time":"10:00","close_time":"20:00","is_close":"0"}, {"day":4,"open_time":"10:00","close_time":"20:00","is_close":"0"}, {"day":5,"open_time":"10:00","close_time":"20:00","is_close":"0"}, {"day":6,"open_time":"10:00","close_time":"20:00","is_close":"0"}, {"day":7,"open_time":"10:00","close_time":"20:00","is_close":"0"}];

      const adduser = await users.create({
        schedule: JSON.stringify(schedules),
        username: req.body.name,
        profileImage: image_name,
        email: req.body.email,
        password: password,
        phone: req.body.phone,
        user_type: 2,
        address: req.body.address,
        description: req.body.description,
        otp_verified:1,
        otp:0,
        // city:req.body.city,
        // age:req.body.age,
        // state:req.body.state,
        // lat: req.body.lat,
        // lng: req.body.lng,
        auth_key: auth_create,
      });
      //console.log(adduser, 'yioiutr===='); return
      if(adduser.dataValues.id){

        // console.log(schedule[0].day);
        // return;
        slot_id=1;
        for(var schedule of schedules){
    
            var final=[];
            var day=schedule.day;
            if(day==7){
                day=0;
            }
            var start=schedule.open_time+':00';
            var end=schedule.close_time+':00';
            var is_close=schedule.is_close;
            var startTime = moment(start, 'HH:mm');
            var endTime = moment(end, 'HH:mm');
        // var startTime = start;
        // var endTime = end;
        
        /*console.log(start)
        console.log(startTime)
        console.log(end)
        console.log(endTime)*/
        if( endTime.isBefore(startTime) ){
            endTime.add(1, 'day');
        }
        var timeStops = [];
        while(startTime <= endTime){
    
            var i=new moment(startTime).format('HH:mm');
            time_array=i.split(':');
    
            time_seconds= (time_array[0]*3600)+(time_array[1]*60);
                // console.log(time_seconds); 
                // return;
                time=i;
                // Check correct time format and split into components
                time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    
                  if (time.length > 1) { // If time format correct
                    time = time.slice (1);  // Remove full string match value
                    time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
                    time[0] = +time[0] % 12 || 12; // Adjust hours
                }
    
                i=time.join ('');
                timeStops.push(new moment(startTime).format('HH:mm'));
                startTime.add(15, 'minutes');
                x=new moment(startTime).format('HH:mm');
                
                time=x;
                // Check correct time format and split into components
                time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    
                  if (time.length > 1) { // If time format correct
                    time = time.slice (1);  // Remove full string match value
                    time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
                    time[0] = +time[0] % 12 || 12; // Adjust hours
                }
    
                x=time.join ('');
                // console.log(i+'-'+x);
    
                    // for (var i = requestdata.open_time; i < requestdata.close_time; i++) {
                        var store_data={};
                        // var x=i;
                        // x++;
                        if(startTime <= endTime){
                            store_data.barber_id= adduser.dataValues.id;
                            store_data.day= day;
                            store_data.slot_id= slot_id;
                            store_data.slot= i+'-'+ x ;
                            store_data.start_time = i;
                            store_data.start_time_seconds = time_seconds;
                            store_data.end_time =  x;
                            store_data.is_close =  is_close;
                            final.push(store_data);
                            slot_id++;
                        }
    
                    }
            // console.log(final);
            // return;
            barbers_time_slot.bulkCreate(final);
        }
    
        
        req.flash("msg", "Barber Successfully Added");
        res.redirect("/admin/userslist_b");
      } else {
        console.log(error);
      }
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
  userslist: async function (req, res) {
    if (req.session && req.session.auth == true) {
      var users_data = await users.findAll({
        attributes: [
          "id",
          "username",
          "profile_image",
          "email",
          "status",
          "phone",
        ],
        where: {
          user_type: 2,
        },

        order: [["id", "DESC"]],
      });
      //  console.log(users_data); return false
      users_data = users_data.map((value) => {
        return value.toJSON();
      });
      var data = await users.findAll({
        attributes: ["country"],
        group: ["country"],
      });
      var data1 = await users.findAll({
        attributes: ["city"],
        group: ["city"],
      });
      //console.log(data); return false
      res.render("admin/userslist_b", {
        sessiondata: req.session,
        response: users_data,
        data,
        data1,
        msg: req.flash("msg"),
        title: "Barber",
      });
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
  users_statuschange: async function (req, res) {
    if (req.session && req.session.auth == true) {
      let update = await users.update(
        {
          status: req.body.status,
        },
        {
          where: {
            id: req.body.id,
          },
        }
      );
      res.json(1);
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
  delete_user: async function (req, res) {
    if (req.session && req.session.auth == true) {
      const dlt = await users.destroy({
        where: {
          id: req.body.id,
        },
      });
      res.json(1);
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
  viewuser: async function (req, res) {
    if (req.session && req.session.auth == true) {
      var users_data = await users.findOne({
        where: {
          id: req.query.id,
        },
      });

      res.render("admin/edituser_b", {
        users_data: users_data,
        msg: req.flash("msg"),
        sessiondata: req.session,
        title: "Barber",
      });
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
  update_user: async function (req, res) {
    if (req.session && req.session.auth == true) {
      image_name = req.body.hiddenimage;
      id = req.body.id;
      //  console.log(id);
      // //  return;
      if (req.files && req.files.image) {
        let image = req.files.image;
        var extension = path.extname(image.name);
        var fileimage = uuid() + extension;
        await image.mv(
          process.cwd() + "/public/images/users/" + fileimage,
          function (err) {
            if (err) return res.status(500).send(err);
          }
        );
        image_name =
          req.protocol + "://" + req.get("host") + "/images/users/" + fileimage;
      } else {
        image_name = req.body.hiddenimage;
      }
      const count = await users.count({
        where: {
          email: req.body.email,
          // [Op.not]: [
          //   { id: [1,2,3] }
          // ],
          id: {
            $not: req.body.id,
          },
        },
      });
      // console.log(count);
      // return;
      if (count > 0) {
        req.flash("msg", "Email already Exist");
        res.redirect("/admin/userslist_b");
        return;
      }

      var updateData={
        username: req.body.name,
        profileImage: image_name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        description: req.body.description,
      }
      if(req.body.password){
			  const password = crypto.createHash('sha1').update(req.body.password).digest('hex');
        updateData.password=password;
      }
      const update_users = await users.update(updateData,
        {
          where: {
            id: req.body.id,
          },
        }
      );
      req.flash("msg", "Barber Successfully Updated");
      res.redirect("/admin/userslist_b");
    } else {
      req.flash("msg", "Please login first");
      res.redirect("/admin");
    }
  },
};
