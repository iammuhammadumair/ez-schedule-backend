 const admin = require('../controller/admin_controller');
 const users = require('../controller/users_controller');
 const terms = require('../controller/terms_controller');
 const category = require('../controller/category_controller');
 const faq = require('../controller/faq_controller');
 const post = require('../controller/posts_controller');
 const api = require('../controller/api_controller');

 module.exports = function (app) {
     /*---------------------dashboard--------------------*/
    app.route('/admin').get(admin.login);
	app.route('/admin/get_dashboard_count').get(admin.get_dashboard_count);
    app.route('/admin/dashboard').get(admin.dashboard);
    app.route('/admin/signin').post(admin.adminlogin);
    app.route('/admin/logout').get(admin.logout);
    app.route('/admin/profile').get(admin.adminprofile);
    app.route('/admin/updateadminprofile').post(admin.updateadminprofile);
    app.route('/admin/updateadminpassword').post(admin.updateadminpassword);


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

    /*-----------------------terms---------------------------*/

     app.route('/admin/terms').get(terms.terms);
     app.route('/admin/update_terms').post(terms.update_terms);

     /*-----------------------privacy policy---------------------------*/

     app.route('/admin/policy').get(terms.privacy_policy);
     app.route('/admin/update_policy').post(terms.update_policy);



     /*-----------------------FAQ---------------------------*/

     app.route('/admin/data').get(faq.list);
     app.route('/admin/statuschange').post(faq.statuschange);
     app.route('/admin/delete').post(faq.delete_data);
     app.route('/admin/add_faq').get(faq.add_data);
     app.route('/admin/createdata').post(faq.createdata);
     app.route('/admin/view_data').get(faq.viewdata);
     app.route('/admin/update_data').post(faq.update_data);

      /*-----------------------Posts---------------------------*/

      app.route('/admin/posts').get(post.postslist);
      app.route('/admin/post_statuschange').post(post.post_statuschange);
      app.route('/admin/deletepost').post(post.delete_post);
      app.route('/admin/viewposts').get(post.viewposts);
	  
	   /*-----------------------api---------------------------*/

		app.route('/api/signIn').post(api.login);
		app.route('/api/logout').post(api.logout);
		app.route('/api/signUp').post(api.sign_up);
		app.route('/api/editprofile').post(api.editprofile);
		app.route('/api/social_login').post(api.social_login);
		app.route('/api/follow').post(api.follow);
		app.route('/api/forgot_password').post(api.forgot_password); 
		app.route('/api/url_id/:id').get(api.url_id); 
		app.route('/api/resetPassword').post(api.resetPassword); 
		app.route('/api/ChangePassword').post(api.ChangePassword); 
		app.route('/api/changenotistatus').post(api.changenotistatus); 
		app.route('/api/createpost').post(api.createpost); 
		app.route('/api/homepagepostlist').post(api.homepagepostlist); 
		app.route('/api/getcategorylist').get(api.getcategorylist); 
		app.route('/api/getfaqlist').get(api.getfaqlist); 
		app.route('/api/getcontent').get(api.getcontent); 
		app.route('/api/userlist').get(api.userlist); 
		app.route('/api/myprofile').get(api.myprofile); 
		app.route('/api/otheruserprofile').get(api.otheruserprofile); 
		app.route('/api/followinglist').get(api.followinglist); 
		app.route('/api/followerslist').get(api.followerslist); 

}


