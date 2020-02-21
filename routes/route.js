 const admin = require('../controller/admin_controller');
 const users = require('../controller/users_controller');
 const terms = require('../controller/terms_controller');
 const category = require('../controller/category_controller');
 const faq = require('../controller/faq_controller');


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
    app.route('/admin/update_user').post(users.update_user);

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
}


