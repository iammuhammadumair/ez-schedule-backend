const admin = require('../controller/admin_controller');
const users = require('../controller/users_controller');
const terms = require('../controller/terms_controller');
const category = require('../controller/category_controller');
const faq = require('../controller/faq_controller');
const post = require('../controller/posts_controller');
const api = require('../controller/api_controller');
const barbers = require('../controller/barbers_controller');
const charities = require('../controller/charities_controller');

const offers = require('../controller/offers_controller');
const adss = require('../controller/ads_controller');
var deeplink = require('node-deeplink');

module.exports = function (app) {
   /*---------------------Website--------------------*/
   app.route('/').get(admin.website);
    /*---------------------dashboard--------------------*/
   app.route('/admin').get(admin.login);
   app.route('/admin/get_dashboard_count').get(admin.get_dashboard_count);
   app.route('/admin/dashboard').get(admin.dashboard);
   app.route('/admin/signin').post(admin.adminlogin);
   app.route('/admin/logout').get(admin.logout);
   app.route('/admin/profile').get(admin.adminprofile);
   app.route('/admin/updateadminprofile').post(admin.updateadminprofile);
   app.route('/admin/updateadminpassword').post(admin.updateadminpassword);
 /*-------------------------Notification-----------------------*/
   app.route('/admin/push').get(admin.push);
   app.route('/admin/push_post').post(admin.push_post);

   /*---------------------category--------------------*/

   app.route('/admin/categories').get(category.categories);
   app.route('/admin/addcategory').post(category.addcategory);
   app.route('/admin/delete_cate').post(category.delete_cate);
   app.route('/admin/cat_statuschange').post(category.cat_statuschange);
 
          
  /*-------------------------users-----------------------*/
   app.route('/admin/adduser').get(users.adduser);
   app.route('/admin/createuser').post(users.createuser);
   app.route('/admin/userslist').get(users.userslist);
   app.route('/admin/users_statuschange').post(users.users_statuschange);
   app.route('/admin/delete_user').post(users.delete_user);
   app.route('/admin/viewuser').get(users.viewuser);
   app.route('/admin/updateuser').post(users.update_user);
   /*-------------------------barbers-----------------------*/
   app.route('/admin/adduser_b').get(barbers.adduser);
   app.route('/admin/createuser_b').post(barbers.createuser);
   app.route('/admin/userslist_b').get(barbers.userslist);
   app.route('/admin/users_statuschange_b').post(barbers.users_statuschange);
   app.route('/admin/delete_user_b').post(barbers.delete_user);
   app.route('/admin/viewuser_b').get(barbers.viewuser);
   app.route('/admin/updateuser_b').post(barbers.update_user);

    /*-----------------------subscription_setting---------------------------*/

    app.route('/admin/subscription').get(terms.subscription_setting);
    app.route('/admin/update_subscription_setting').post(terms.update_subscription_setting);
    // app.route('/web_terms').get(terms.web_terms);

   /*-----------------------terms---------------------------*/

    app.route('/admin/terms').get(terms.terms);
    app.route('/admin/update_terms').post(terms.update_terms);
    app.route('/web_terms').get(terms.web_terms);
    
    /*-----------------------privacy policy---------------------------*/

    app.route('/admin/policy').get(terms.privacy_policy);
    app.route('/admin/update_policy').post(terms.update_policy);

    app.route('/web_policy').get(terms.web_policy);




    /*-----------------------FAQ---------------------------*/

    app.route('/admin/data').get(faq.list);
    app.route('/admin/statuschange').post(faq.statuschange);
    app.route('/admin/delete').post(faq.delete_data);
    app.route('/admin/add_faq').get(faq.add_data);
    app.route('/admin/createdata').post(faq.createdata);
    app.route('/admin/view_data').get(faq.viewdata);
    app.route('/admin/update_data').post(faq.update_data);

     /*-----------------------Posts---------------------------*/

     app.route('/admin/orders').get(post.postslist);
     app.route('/admin/post_statuschange').post(post.post_statuschange);
     app.route('/admin/deletepost').post(post.delete_post);
     app.route('/admin/viewposts').get(post.viewposts);
     
      /*-----------------------api---------------------------*/
       app.route('/api/subscription_setting').get(api.subscription_setting);
       app.route('/api/signIn').post(api.login);
       app.route('/api/verify_otp').post(api.verify_otp);
       app.route('/api/resend_otp').post(api.resend_otp);
       
       
       app.route('/api/logout').post(api.logout);
       app.route('/api/update_lat_long').post(api.update_lat_long);
       
       app.route('/api/signUp').post(api.sign_up);
       app.route('/api/delete_profile').post(api.delete_profile);
       app.route('/api/editprofile').post(api.editprofile);
       app.route('/api/social_login').post(api.social_login);
       app.route('/api/follow').post(api.follow);
       app.route('/api/unfollow').post(api.unfollow);
       app.route('/api/forgot_password').post(api.forgot_password); 
       app.route('/api/url_id/:id').get(api.url_id); 
       app.route('/api/resetPassword').post(api.resetPassword); 
       app.route('/api/ChangePassword').post(api.ChangePassword); 
       app.route('/api/changenotistatus').post(api.changenotistatus); 
       // Services API
       app.route('/api/add_category').post(api.add_category); 
       
       app.route('/api/add_services').post(api.add_services); 
       app.route('/api/update_services').post(api.update_services); 
       app.route('/api/barber_services').post(api.barber_services); 
       app.route('/api/delete_services').post(api.delete_services);

       app.route('/api/fav_unfav').post(api.fav_unfav); 

      app.route('/api/home').post(api.home); 
      app.route('/api/fav_list').get(api.fav_list); 
      app.route('/api/feeds').get(api.feeds); 
      app.route('/api/add_feed').post(api.add_feed); 
      app.route('/api/barber_profile').post(api.barber_profile); 
      app.route('/api/barber_list').post(api.barber_list); 
      app.route('/api/getcontent').get(api.getcontent); 

      app.route('/api/barber_requests').get(api.barber_requests); 
      app.route('/api/barber_request_status').post(api.barber_request_status); 
      app.route('/api/cancel_order').post(api.cancel_order); 
      app.route('/api/barber_orders').post(api.barber_orders); 
      app.route('/api/calender_orders').post(api.calender_orders); 
      app.route('/api/order_detail').post(api.order_detail); 

      app.route('/api/swap_requests').post(api.swap_requests); 
      app.route('/api/user_swap_request').post(api.user_swap_request); 

      app.route('/api/request_sent_to_barber').get(api.request_sent_to_barber); 
      app.route('/api/user_orders').post(api.user_orders); 
      app.route('/api/book_barber').post(api.book_barber); 
      app.route('/api/order_payment').post(api.order_payment); 
      app.route('/api/charity_payment').post(api.charity_payment); 
      app.route('/api/services_with_time_slot').post(api.services_with_time_slot); 
      app.route('/api/time_slots').post(api.time_slots); 
       app.route('/api/all_time_slots').post(api.all_time_slots); 
      
      app.route('/api/check_slot_availability').post(api.check_slot_availability); 
      app.route('/api/swap_request_status').post(api.swap_request_status); 
      app.route('/api/send_push_user').post(api.send_push_user); 
      app.route('/api/rating_and_strike').post(api.rating_and_strike); 
      app.route('/api/get_rating_and_strike').post(api.get_rating_and_strike); 
      app.route('/api/reward_setting').post(api.reward_setting);
      app.route('/api/get_default_charity').post(api.get_default_charity); 
      app.route('/api/oauth').get(api.oauth); 
      

 
       app.route('/api/getcategorylist').get(api.getcategorylist); 
       app.route('/api/getfaqlist').get(api.getfaqlist); 
       app.route('/api/userlist').get(api.userlist); 
       app.route('/api/myprofile').get(api.myprofile); 
       app.route('/api/notifiactionlist').get(api.notifiactionlist); 
       app.route('/api/otheruserprofile').get(api.otheruserprofile); 
       app.route('/api/followinglist').get(api.followinglist); 
       app.route('/api/followerslist').get(api.followerslist); 

       app.route('/api/offers').post(api.offers); 
       app.route('/api/ads').post(api.ads); 
       app.route('/api/track_sale').post(api.track_sale); 
          /*-------------------------charities-----------------------*/
       app.route('/admin/add_charity').get(charities.add_charity);
       app.route('/admin/createcharity').post(charities.createcharity);
       app.route('/admin/charities').get(charities.charitieslist);
       app.route('/admin/charities_statuschange').post(charities.charities_statuschange);
       app.route('/admin/delete_charity').post(charities.delete_charity);
       app.route('/admin/viewcharity').get(charities.viewcharity);
       app.route('/admin/updatecharity').post(charities.updatecharity);
       app.route('/admin/charity_payment').get(charities.charity_payment);

       /*-------------------------offers-----------------------*/
   app.route('/admin/addoffer').get(offers.addoffer);
   app.route('/admin/createoffer').post(offers.createoffer);
   app.route('/admin/offerslist').get(offers.offerslist);
   app.route('/admin/offers_statuschange').post(offers.offers_statuschange);
   app.route('/admin/delete_offer').post(offers.delete_offer);
   app.route('/admin/viewoffer').get(offers.viewoffer);
   app.route('/admin/updateoffer').post(offers.update_offer);
   /*-------------------------ads-----------------------*/
   app.route('/admin/addads').get(adss.addad);
   app.route('/admin/createad').post(adss.createad);
   app.route('/admin/adslist').get(adss.adslist);
   app.route('/admin/ads_statuschange').post(adss.ads_statuschange);
   app.route('/admin/delete_ads').post(adss.delete_ad);
   app.route('/admin/viewads').get(adss.viewad);
   app.route('/admin/updateads').post(adss.update_ad);
   app.route('/api/barber_subscription').post(api.barber_subscription); 
   app.route('/api/cancel_subscription').post(api.cancel_subscription); 
   app.route('/api/language').post(api.language); 

     app.get(
        '/deeplink',
        deeplink({
          fallback: 'http://ezschedule43.com',
          android_package_name: 'com.ez_schedule',
          ios_store_link:'https://apps.apple.com/us/app/ez-schedule/id1535032895?itsct=apps_box&itscg=30200'
        })
      ); 
}

// status 
//   0 => Requested to barber
//   1 => Request accepted by barber
//   2 => Request declined by barber
//   3 => Payment done by user and order placed
//   4 => Mark as complete by barber  
//   5 => Cancel by Barber
//   6 => Cancel by user  


// push codes :
//   Book barber =>1111
//   accpet request =>1112
//   reject request =>1113
//   Payment done and  order placed =>1114
//   Mark as complete =>1115
//   Swap request add=>1116
//   Cancel by Barber =>1117

/*
Get running process 
$ netstat -nlp | grep :8080
  kill 1073*/




