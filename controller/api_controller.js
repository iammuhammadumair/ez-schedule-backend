const db = require('../models');
const user = db.users;
var request_module = require('request');
var http = require('http');

const barber = db.barbers;
const barbers_time_slot = db.barbers_time_slot;
const category = db.category;
const charities = db.charities;
const charity_payment = db.charity_payment;
const block_dates = db.block_dates;
const offers = db.offers
const ads = db.ads
const faq = db.faq
const terms = db.terms
const posts = db.posts;
const services = db.services;
const likes = db.likes;
const feeds = db.feeds;
const orders = db.orders;
const reviews = db.reviews;
const order_services = db.order_services;
const swap_requests = db.swap_requests;

const vote = db.votecasting;
const postsImages = db.postsImages;
const notifcation = db.notifcations
const connection = db.connections;
var crypto = require('crypto');
const helper = require('../config/helper');
const jsonData = require('../config/jsonData');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const empty = require('is-empty');
const superagent = require('superagent');
const moment = require('moment'); // require

swap_requests.belongsTo(user, {
	foreignKey: 'user_id',
});
reviews.belongsTo(user, {
	foreignKey: 'from_id',
});
likes.belongsTo(barber, {
	foreignKey: 'barber_id',
});
feeds.belongsTo(user, {
	foreignKey: 'user_id',
});
services.belongsTo(barber, {
	foreignKey: 'barber_id',
});
orders.belongsTo(user, {
	foreignKey: 'user_id',
});
orders.belongsTo(barber, {
	foreignKey: 'barber_id',
});

barber.hasMany(services, {
	foreignKey: 'barber_id'
});
orders.hasMany(order_services, {
	foreignKey: 'order_id'
});
// services.belongsTo(barber);


posts.hasMany(postsImages)
module.exports = {
	resetPassword: async function (req, res) {
		try {

			const pass = crypto.createHash('sha1').update(req.body.confirm_password).digest('hex');
			const save = await user.update({
				password: pass,
				forgotPassword: '',
			},
				{
					where: {
						forgotPassword: req.body.hash
					}
				}
			);
			if (save) {
				res.render('success_page', { msg: "Password Changed successfully" });
			} else {
				res.render('success_page', { msg: "Invalid user" });
			}

		} catch (errr) {
			throw errr
		}

	},
	url_id: async function (req, res) {
		try {
			// console.log(req.params.id, "=================req.params.id");
			const data = await user.findOne({
				attributes: ['forgotPassword'],
				where: {
					forgotPassword: req.params.id,
				}
			});

			if (data) {
				// console.log(data.length); return false;	
				res.render("reset_password", {
					title: "instadate",
					response: data.dataValues.forgot_password,
					flash: "",
					hash: req.params.id
				});
			} else {
				res.render('success_page', { msg: "Link has been expired!" });

				// res.status(403).send("Link has been expired!");
			}

		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	get_default_charity: async function (req, res) {
		try {

			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key

			};
			const non_required = {
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const data = await charities.findOne({
				attributes: [`id`, `name`, `image`, `description`, `square_account`, `status`, `createdAt`],

				where: {
					status: 1,
				}
			});

			if (data) {
				let msg = 'Charity Detail';

				jsonData.true_status(res, data, msg)


			} else {
				let msg = 'NO Charity Found';
				jsonData.wrong_status(res, msg)
			}

		} catch (errr) {
			throw errr
		}

	},
	forgot_password: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				email: req.body.email
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const data = await user.findOne({
				where: {
					email: requestdata.email
				}
			});
			if (data) {
				var otp = crypto.randomBytes(20).toString('hex');
				const save = await user.update({
					forgotPassword: otp
				},
					{
						where: {
							id: data.dataValues.id
						}
					}
				);
				helper.send_emails(otp, data);

				let msg = 'Email sent successfully';
				var body = {}
				jsonData.true_status(res, body, msg)

			} else {
				let msg = 'Email does not exist';
				jsonData.wrong_status(res, msg)
			}
		}
		catch (errr) {
			jsonData.wrong_status(res, errr)

		}

	},
	resend_otp: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key

			};
			const non_required = {
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				attributes: [`id`, `username`, `avg_rating`, `auth_key`, `otp`, `profile_image`, `phone`, `email`, `user_type`, `otp_verified`, `lat`, `lng`, `address`, `description`,
				],
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			// var fullUrl = req.protocol + '://' + req.get('host');
			// console.log(fullUrl);
			if (user_data) {
				var otp = Math.floor(1000 + Math.random() * 9000);

				const get_lang = await user.findOne({
					attributes: ['language'],
					where: {
						auth_key: requestdata.auth_key,
					}
				});

				var msg_obj = {};

				if (get_lang.dataValues.language == 1) {
					msg_obj.Body = "Your OTP for EZ Schedule is " + otp;
				} else {
					msg_obj.Body = "Su OTP para EZ Schedule es " + otp;
				}
				// msg_obj.Body="Your OTP for EZ Schedule is "+otp;
				msg_obj.To = user_data.dataValues.phone;
				await helper.twilio_sms(msg_obj, res);
				const update_details = await user.update({
					otp: otp,
					otp_verified: 0
				},
					{
						where: {
							id: user_data.dataValues.id,
						}
					}
				);
				// let data = await helper.userdetail(user_data.dataValues.id);
				let msg = 'OTP Sent successfully';
				delete user_data.dataValues.otp;
				var body = user_data;

				jsonData.true_status(res, {}, msg)


			} else {
				let msg = 'Invalid authorization';
				jsonData.wrong_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	verify_otp: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				otp: req.body.otp,
				auth_key: req.headers.auth_key

			};
			const non_required = {
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				attributes: [`id`, `username`, `avg_rating`, `auth_key`, `otp`, `profile_image`, `phone`, `email`, `user_type`, `otp_verified`, `open_time`, `close_time`, `lat`, `lng`, `address`, `description`, `reward_percentage`, `reward_order_count`
				],
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			// var fullUrl = req.protocol + '://' + req.get('host');
			// console.log(fullUrl);
			if (user_data) {
				if (user_data.dataValues.otp == requestdata.otp) {

					const update_details = await user.update({
						otp: 0,
						otp_verified: 1
					},
						{
							where: {
								id: user_data.dataValues.id,
							}
						}
					);
					// let data = await helper.userdetail(user_data.dataValues.id);
					let msg = 'OTP verified successfully';
					delete user_data.dataValues.otp;
					var body = user_data;

					jsonData.true_status(res, body, msg)

				}
				else {
					let msg = 'Invalid OTP';
					jsonData.wrong_status(res, msg)
				}
			} else {
				let msg = 'Invalid authorization';
				jsonData.wrong_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	login: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				email: req.body.email,
				// user_type: req.body.user_type,

				password: req.body.password
			};
			const non_required = {
				language: req.body.language,

				device_type: req.body.device_type,
				device_token: req.body.device_token
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const password = crypto.createHash('sha1').update(requestdata.password).digest('hex');
			const user_data = await user.findOne({
				where: {
					email: requestdata.email,
					// user_type: requestdata.user_type,

					password: password
				}
			});
			if (user_data) {
				var auth_create = crypto.randomBytes(20).toString('hex');
				if (user_data.dataValues.otp_verified == 0) {
					var otp = Math.floor(1000 + Math.random() * 9000);
					let update_otp = await user.update({
						otp: otp,
						auth_key: auth_create,
						deviceType: requestdata.device_type,
						deviceToken: requestdata.device_token
					},
						{
							where: {
								id: user_data.dataValues.id,
							}
						}
					);

					const get_lang = await user.findOne({
						attributes: ['language'],
						where: {
							auth_key: auth_create,
						}
					});

					var msg_obj = {};

					if (get_lang.dataValues.language == 1) {
						msg_obj.Body = "Your OTP for EZ Schedule is " + otp;
					} else {
						msg_obj.Body = "Su OTP para EZ Schedule es " + otp;
					}
					msg_obj.To = user_data.dataValues.phone;
					await helper.twilio_sms(msg_obj, res);
					let data = await helper.userdetail(user_data.dataValues.id, req);

					if (user_data.dataValues.language == 1) {
						msg = 'Your account is not verified till now. An OTP is sent to you for your account verificatiion.';
					} else {
						msg = "Su cuenta no está verificada hasta ahora.Se le envía una OTP para su cuenta verificación. ";
					}

					jsonData.true_status(res, data, msg)
				}

				const update_details = await user.update({
					auth_key: auth_create,
					deviceType: requestdata.device_type,
					deviceToken: requestdata.device_token
				},
					{
						where: {
							id: user_data.dataValues.id,
						}
					}
				);
				let data = await helper.userdetail(user_data.dataValues.id, req);
				if (requestdata.language == 1) {
					msg = 'User Logged In successfully';
				} else {
					msg = 'El usuario inició sesión correctamente';
				}
				// let msg = 'User Logged In successfully';
				jsonData.true_status(res, data, msg)

			}
			else {
				if (requestdata.language == 1) {
					msg = 'Incorrect Email or Password';
				} else {
					msg = 'Correo o contraseña incorrectos';
				}
				jsonData.wrong_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},

	logout: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				const detail_data = await user.update({
					auth_key: '',
					deviceToken: ''
				},
					{
						where:
						{
							id: user_data.dataValues.id
						}
					});
				let msg = 'Logout Successfully';
				let data = {};
				jsonData.true_status(res, data, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	sign_up: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				username: req.body.username,
				email: req.body.email,
				phone: req.body.phone,
				password: req.body.password,
				user_type: req.body.user_type,

				// open_time: req.body.open_time,
				// close_time: req.body.close_time
				// city: req.body.city,
				// state: req.body.state,
				// gender: req.body.gender,
				// age: req.body.age,
			};
			const non_required = {
				schedule: req.body.schedule,

				lat: req.body.lat,
				lng: req.body.lng,
				address: req.body.address,
				description: req.body.description,
				device_type: req.body.device_type,
				device_token: req.body.device_token,
				social_id: req.body.social_id,
				language: req.body.language,
				loginType: req.body.loginType
			};
			let requestdata = await helper.vaildObject(required, non_required, res);

			let otp = Math.floor(1000 + Math.random() * 9000);
			// otp = 1111;

			const check_phone = await user.findOne({
				where: {
					phone: requestdata.phone,
				}
			});
			if (check_phone && check_phone.dataValues.id) {
				if (requestdata.language == 1) {
					throw 'Phone already exist';
				} else {
					throw 'El teléfono ya existe';
				}

				// console.log(1);
				// let msg = 'Phone already exist';
				// jsonData.wrong_status(res, msg)
			}
			const user_data = await user.findOne({
				where: {
					email: requestdata.email,
				}
			});
			if (user_data && user_data.dataValues.id) {
				// console.log(2);
				if (requestdata.language == 1) {
					throw 'Email already exist';
				} else {
					throw 'Ya existe el correo electrónico';
				}


				// let msg = 'Email already exist';
				// jsonData.wrong_status(res, msg)
			} else {
				// let otp = Math.floor(1000 + Math.random() * 9000);
				if (requestdata.social_id) {
					var auth_create = crypto.randomBytes(80).toString('hex');
					imageName = '';
					if (req.files && req.files.profile_image) {
						imageName = req.protocol + '://' + req.get('host') + '/images/users/' + helper.image_upload(req.files.profile_image);
					}
					const update_details = await user.update({
						username: requestdata.username,
						email: requestdata.email,
						phone: requestdata.phone,
						password: password,
						profile_image: imageName,
						/*country: requestdata.country,
						dob: requestdata.dob,
						gender: requestdata.gender,
						state: requestdata.state,
						city: requestdata.city,
						age: requestdata.age,*/
						auth_key: auth_create,
						deviceType: requestdata.device_type,
						deviceToken: requestdata.device_token,
					},
						{
							where: {
								socialId: requestdata.social_id,
							}
						}
					);
					let data2 = await helper.userdetail(requestdata.social_id);
					let msg = 'Registered successfully';
					jsonData.true_status(res, data2, msg)
				} else {
					const password = crypto.createHash('sha1').update(requestdata.password).digest('hex');
					var auth_create = crypto.randomBytes(20).toString('hex');
					imageName = '';
					if (req.files && req.files.profile_image) {
						imageName = req.protocol + '://' + req.get('host') + '/images/users/' + helper.image_upload(req.files.profile_image);
					}
					if (!requestdata.schedule) {
						requestdata.schedule = 'none';
					}

					const create_user = await user.create({
						username: requestdata.username,
						email: requestdata.email,
						phone: requestdata.phone,
						password: password,
						profile_image: imageName,
						lat: requestdata.lat,
						lng: requestdata.lng,
						address: requestdata.address,
						description: requestdata.description,
						user_type: requestdata.user_type,
						otp: otp,
						auth_key: auth_create,
						schedule: requestdata.schedule,
						// close_time: requestdata.close_time,
						deviceType: requestdata.device_type,
						deviceToken: requestdata.device_token,
					});
					// console.log(result.id);

					if (requestdata.user_type == 2 && create_user.dataValues.id) {
						var schedules = JSON.parse(requestdata.schedule);
						// console.log(schedule[0].day);
						// return;
						slot_id = 1;
						for (var schedule of schedules) {

							var final = [];
							var day = schedule.day;
							if (day == 7) {
								day = 0;
							}
							var start = schedule.open_time + ':00';
							var end = schedule.close_time + ':00';
							var is_close = schedule.is_close;
							var startTime = moment(start, 'HH:mm');
							var endTime = moment(end, 'HH:mm');
							// var startTime = start;
							// var endTime = end;

							/*console.log(start)
							console.log(startTime)
							console.log(end)
							console.log(endTime)*/
							if (endTime.isBefore(startTime)) {
								endTime.add(1, 'day');
							}
							var timeStops = [];
							while (startTime <= endTime) {

								var i = new moment(startTime).format('HH:mm');
								time_array = i.split(':');

								time_seconds = (time_array[0] * 3600) + (time_array[1] * 60);
								// console.log(time_seconds); 
								// return;
								time = i;
								// Check correct time format and split into components
								time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

								if (time.length > 1) { // If time format correct
									time = time.slice(1);  // Remove full string match value
									time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
									time[0] = +time[0] % 12 || 12; // Adjust hours
								}

								i = time.join('');
								timeStops.push(new moment(startTime).format('HH:mm'));
								startTime.add(15, 'minutes');
								x = new moment(startTime).format('HH:mm');

								time = x;
								// Check correct time format and split into components
								time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

								if (time.length > 1) { // If time format correct
									time = time.slice(1);  // Remove full string match value
									time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
									time[0] = +time[0] % 12 || 12; // Adjust hours
								}

								x = time.join('');
								// console.log(i+'-'+x);

								// for (var i = requestdata.open_time; i < requestdata.close_time; i++) {
								var store_data = {};
								// var x=i;
								// x++;
								if (startTime <= endTime) {
									store_data.barber_id = create_user.dataValues.id;
									store_data.day = day;
									store_data.slot_id = slot_id;
									store_data.slot = i + '-' + x;
									store_data.start_time = i;
									store_data.start_time_seconds = time_seconds;
									store_data.end_time = x;
									store_data.is_close = is_close;
									final.push(store_data);
									slot_id++;
								}

							}
							// console.log(final);
							// return;
							barbers_time_slot.bulkCreate(final);
						}
					}
					var msg_obj = {};
					if (requestdata.language == 1) {
						msg_obj.Body = "Your OTP for EZ Schedule is " + otp;
					} else {
						msg_obj.Body = "Su OTP para EZ Schedule es " + otp;
					}
					// msg_obj.Body="Your OTP for EZ Schedule is "+otp;
					msg_obj.To = requestdata.phone;
					await helper.twilio_sms(msg_obj, res);
					if (create_user) {
						let data = await helper.userdetail(create_user.dataValues.id, req);
						if (requestdata.language == 1) {
							msg = 'Registered successfully';
						} else {
							msg = 'Registrado correctamente';

						}
						jsonData.true_status(res, data, msg)
					} else {
						let msg = 'Try again Sometime';
						jsonData.invalid_status(res, msg)
					}
				}
			}
		}
		catch (error) {
			console.log(error);
			jsonData.wrong_status(res, error)
		}
	},
	editprofile: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				username: req.body.username,
				email: req.body.email,
				phone: req.body.phone,
			};
			const non_required = {
				lat: req.body.lat,
				lng: req.body.lng,
				address: req.body.address,
				description: req.body.description,
				schedule: req.body.schedule,
				ids: req.body.ids,
				block_date: req.body.block_date,
				block_whole_day: req.body.block_whole_day,


			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			// console.log(req.files.profile_image);
			// return;
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			const check_email = await user.findOne({
				where: {
					email: requestdata.email,
					[Op.not]: [
						{ id: user_data.dataValues.id }
					]
				}
			});
			if (check_email && check_email.dataValues.id) {
				// console.log(2);
				if (user_data.dataValues.language == 1) {
					msg = 'Email already exist';
				} else {
					msg = 'Ya existe el correo electrónico';
				}
				// let msg = 'Email already exist';
				jsonData.wrong_status(res, msg)
			}
			const check_phone = await user.findOne({
				where: {
					phone: requestdata.phone,
					[Op.not]: [
						{ id: user_data.dataValues.id }
					]
				}
			});
			if (check_phone && check_phone.dataValues.id) {
				// console.log(2);
				if (user_data.dataValues.language == 1) {
					msg = 'Phone already exist';
				} else {
					msg = 'El teléfono ya existe';
				}
				// let msg = 'Phone already exist';
				jsonData.wrong_status(res, msg)
			}
			if (user_data) {

				save_data = {};
				let imageName = user_data.dataValues.profile_image;
				let userid = user_data.dataValues.id;
				if (req.files && req.files.profile_image) {
					imageName = req.protocol + '://' + req.get('host') + '/images/users/' + helper.image_upload(req.files.profile_image);
				}
				// console.log(imageName);
				// return;
				save_data = requestdata;
				save_data.profile_image = imageName;
				// console.log(save_data);
				// return;
				const detail_data = await user.update(save_data,
					{
						where:
						{
							id: userid
						}
					});

				if (user_data.dataValues.user_type == 2 && (requestdata.ids || requestdata.block_whole_day) && requestdata.block_date) {
					console.log(requestdata.block_whole_day);
					if (requestdata.block_whole_day) {

						const check_block_date = await block_dates.findOne({
							where: {
								barber_id: userid,
								block_date: requestdata.block_date,
							}
						});


						if (requestdata.block_whole_day == 1) {

							if (!check_block_date && empty(check_block_date)) {
								const block = {};
								block.barber_id = userid;
								block.block_date = requestdata.block_date;
								var save = await block_dates.create(block);
							}
						} else {
							if (check_block_date && !empty(check_block_date)) {
								const delete_block_date = await block_dates.destroy({
									where: {
										barber_id: userid,
										block_date: requestdata.block_date,
									}
								});
							}
						}

					}
					if (requestdata.ids) {


						var ids = JSON.parse(requestdata.ids);
						console.log(ids);
						for (var id of ids) {
							// console.log(id.is_close);
							var save_slot_status = await barbers_time_slot.update({
								is_close: id.is_close,
							}, {
								where: {
									slot_id: id.slot_id,
									barber_id: user_data.dataValues.id
								}
							});
							if (id.is_close == 1) {
								save_data = {};
								// save_data=requestdata;
								save_data.user_id = user_data.dataValues.id;
								save_data.barber_id = user_data.dataValues.id;
								save_data.date = requestdata.block_date;
								save_data.slot_id = id.slot_id;
								save_data.total_amount = 0;
								save_data.services = 1;
								save_data.status = 3;
								save_data.is_self = 1;
								save_data.type = 2;

								var save = await orders.create(save_data);

							} else {
								var request = await orders.findOne({
									attributes: ['id'],
									where: {
										barber_id: user_data.dataValues.id,
										user_id: user_data.dataValues.id,
										date: requestdata.block_date,
										slot_id: id.slot_id
									}
								});
								if (request && request.length > 0) {
									var delete_booked_slot = await orders.destroy(
										{
											where:
											{
												id: request.dataValues.id
											}
										});
								}

							}


						}
					}

				}



				if (user_data.dataValues.user_type == 2 && requestdata.schedule) {
					/*console.log(user_data.dataValues.user_type);
					return;*/
					//delete previous schedule
					const delete_schedule = await barbers_time_slot.destroy(
						{
							where:
							{
								barber_id: user_data.dataValues.id
							}
						});

					var schedules = JSON.parse(requestdata.schedule);
					// console.log(schedule[0].day);
					// return;

					slot_id = 1;
					for (var schedule of schedules) {

						var final = [];
						var day = schedule.day;
						var start = schedule.open_time + ':00';
						var end = schedule.close_time + ':00';
						var is_close = schedule.is_close;
						var startTime = moment(start, 'HH:mm');
						var endTime = moment(end, 'HH:mm');
						// var startTime = start;
						// var endTime = end;

						/*console.log(start)
						console.log(startTime)
						console.log(end)
						console.log(endTime)*/
						if (endTime.isBefore(startTime)) {
							endTime.add(1, 'day');
						}
						var timeStops = [];
						while (startTime <= endTime) {

							var i = new moment(startTime).format('HH:mm');
							time_array = i.split(':');

							time_seconds = (time_array[0] * 3600) + (time_array[1] * 60);
							// console.log(time_seconds); 
							// return;
							time = i;
							// Check correct time format and split into components
							time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

							if (time.length > 1) { // If time format correct
								time = time.slice(1);  // Remove full string match value
								time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
								time[0] = +time[0] % 12 || 12; // Adjust hours
							}

							i = time.join('');
							timeStops.push(new moment(startTime).format('HH:mm'));
							startTime.add(15, 'minutes');
							x = new moment(startTime).format('HH:mm');

							time = x;
							// Check correct time format and split into components
							time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

							if (time.length > 1) { // If time format correct
								time = time.slice(1);  // Remove full string match value
								time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
								time[0] = +time[0] % 12 || 12; // Adjust hours
							}

							x = time.join('');
							// console.log(i+'-'+x);

							// for (var i = requestdata.open_time; i < requestdata.close_time; i++) {
							var store_data = {};
							// var x=i;
							// x++;
							if (startTime <= endTime) {
								store_data.barber_id = user_data.dataValues.id;
								store_data.day = day;
								store_data.slot_id = slot_id;
								store_data.slot = i + '-' + x;
								store_data.start_time = i;
								store_data.start_time_seconds = time_seconds;
								store_data.end_time = x;
								store_data.is_close = is_close;
								final.push(store_data);
								slot_id++;
							}

						}
						// console.log(final);
						// return;
						barbers_time_slot.bulkCreate(final);
					}

				}
				let msg = 'Updated Successfully';
				let data = await helper.userdetail(userid, req);
				jsonData.true_status(res, data, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	social_login: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				social_id: req.body.social_id,
				loginType: req.body.loginType,

			};
			const non_required = {
				name: req.body.name,
				email: req.body.email,
				profile_image: req.body.profile_image,
				age: req.body.age,
				country: req.body.country,
				dob: req.body.dob,
				city: req.body.city,
				gender: req.body.gender,
				state: req.body.state,
				loginType: req.body.loginType,
				device_type: req.body.device_type,
				device_token: req.body.device_token,
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const social_data = await user.findOne({
				where: {
					socialId: requestdata.social_id,

				}
			});
			if (social_data) {
				var auth_create = crypto.randomBytes(80).toString('hex');
				const update_details = await user.update({
					loginType: requestdata.loginType,
					auth_key: auth_create,
					deviceType: requestdata.device_type,
					deviceToken: requestdata.device_token
				},
					{
						where: {
							socialId: requestdata.social_id,
						}
					}
				);
				let data2 = await helper.userdetail(social_data.dataValues.id);
				let msg = 'Login successfully';
				jsonData.true_status(res, data2, msg)

			} else {
				var auth_create = crypto.randomBytes(80).toString('hex');
				const create_user = await user.create({
					username: requestdata.name,
					email: requestdata.email,
					age: requestdata.age,
					country: requestdata.country,
					dob: requestdata.dob,
					city: requestdata.city,
					gender: requestdata.gender,
					state: requestdata.state,
					profile_image: requestdata.profile_image,
					socialId: requestdata.social_id,
					loginType: requestdata.loginType,
					auth_key: auth_create,
					deviceType: requestdata.device_type,
					deviceToken: requestdata.device_token,
				});
				if (create_user) {
					let data2 = await helper.userdetail(create_user.dataValues.id);
					let msg = 'Registered successfully';
					jsonData.true_status(res, data2, msg)
				} else {
					let msg = 'Try again Sometime';
					jsonData.invalid_status(res, msg)
				}

			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	home: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				lat: req.body.lat,
				lng: req.body.lng
			};
			const non_required = {
				search: req.body.search

			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let user_id = userdata.dataValues.id;
				if (userdata.dataValues.language == 1) {
					att = [`id`, `name`, `image`]
				} else {
					att = [`id`, `image`,
						[sequelize.literal('name_spanish'), 'name'],
					]
				}
				const categorydata = await category.findAll({
					attributes: att,
					where: {
						status: 1,
					}
				});
				/*const all_barbers = await user.findAll({
					attributes: [`id`, `username`,`avg_rating`, `profile_image`, `phone`, `email`, `user_type`,`otp_verified`, `lat`, `lng`, `address`,`description`,
					],
					where: {
						status:1,
						user_type:2,
					}
				});*/
				lat = requestdata.lat;
				lng = requestdata.lng;
				var all_barbers = [];
				if (!empty(requestdata.search)) {
					all_barbers = await user.findAll({
						attributes: [`id`, `username`, `avg_rating`, `profile_image`, `phone`, `email`, `user_type`, `otp_verified`, `lat`, `lng`, `address`, `description`,
							[sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(lat)) * cos(radians(" + lng + ") - radians(lng)) + sin(radians(" + lat + ")) * sin(radians(lat)))"), 'distance']],
						where: [{
							status: 1,
							user_type: 2,
							username: {
								[Op.like]: '%' + requestdata.search + '%'
							},

						},
							// sequelize.where("6371 * acos(cos(radians("+lat+")) * cos(radians(lat)) * cos(radians("+lng+") - radians(lng)) + sin(radians("+lat+")) * sin(radians(lat)))", {[Op.lte]: 10000})
						],
						// having: {'distance <=':1000},
						order: sequelize.col('distance'),

					});
				} else {
					all_barbers = await user.findAll({
						attributes: [`id`, `username`, `avg_rating`, `profile_image`, `phone`, `email`, `user_type`, `otp_verified`, `lat`, `lng`, `address`, `description`,
							[sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(lat)) * cos(radians(" + lng + ") - radians(lng)) + sin(radians(" + lat + ")) * sin(radians(lat)))"), 'distance']],
						where: [{
							status: 1,
							user_type: 2,

						},
							// sequelize.where("6371 * acos(cos(radians("+lat+")) * cos(radians(lat)) * cos(radians("+lng+") - radians(lng)) + sin(radians("+lat+")) * sin(radians(lat)))", {[Op.lte]: 10000})
						],
						// having: {'distance <=':1000},
						order: sequelize.col('distance'),

					});
				}
				const final_barber_list = [];
				if (all_barbers) {
					for (let barber of all_barbers) {
						let is_fav = await likes.findOne({
							where: {
								barber_id: barber.dataValues.id,
								user_id: user_id
							}
						});
						if (barber.dataValues.profile_image) {

							// barber.dataValues.profile_image = req.protocol + '://' + req.get('host') + '/images/users/' + barber.dataValues.profile_image;
						}

						var barber_data = barber.dataValues;
						// barber_data.is_rated=0;
						// console.log(is_fav);

						if (is_fav) {
							barber_data.is_fav = 1;
						} else {
							barber_data.is_fav = 0;
						}
						final_barber_list.push(barber_data);
					}

				}
				// console.log(all_barbers);

				let msg = 'Home data';
				let finaldata = {};
				finaldata.categorydata = categorydata;
				finaldata.all_barbers = final_barber_list;
				// console.log(finaldata);
				jsonData.true_status(res, finaldata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			console.log(error);
			jsonData.wrong_status(res, error)
		}
	},
	fav_unfav: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				let user_id = user_data.dataValues.id;

				const check_fav = await likes.findOne({
					where: {
						user_id: user_id,
						barber_id: requestdata.barber_id,
					}
				});
				if (check_fav) {
					const delete_fav = await likes.destroy({
						where: {
							id: check_fav.dataValues.id
						}
					});
				} else {
					const save_fav = await likes.create({
						user_id: user_id,
						barber_id: requestdata.barber_id,
					});
				}


				let msg = 'Done';
				jsonData.true_status(res, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			console.log(error);
			jsonData.wrong_status(res, error)
		}
	},
	getcategorylist: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				if (userdata.dataValues.language == 1) {
					att = [`id`, `name`, `image`]
				} else {
					att = [`id`, `image`,
						[sequelize.literal('name_spanish'), 'name'],
					]
				}
				const categorydata = await category.findAll({
					attributes: att,
					where: {
						status: 1,
					}
				});
				let msg = 'Category list';
				jsonData.true_status(res, categorydata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	getfaqlist: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);

			const faqdata = await faq.findAll({
				attributes: [`id`, `questions`, `answers`],
				where: {
					status: 1,
				}
			});
			let msg = 'faq list';
			jsonData.true_status(res, faqdata, msg)

		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	getcontent: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);

			const Contentdata = await terms.findOne({
				attributes: [`termsContent`, `privacyPolicy`, `terms_spanish`, `policy_spanish`, `barber_term`, `barber_policy`],
				where: {
					status: 1,
				}
			});
			var ttt = Contentdata.dataValues.privacyPolicy.replace(/(\r\n|\n|\r|\t)/gm, "");
			var ttt2 = Contentdata.dataValues.termsContent.replace(/(\r\n|\n|\r|\t)/gm, "");
			var ttt3 = Contentdata.dataValues.barber_term.replace(/(\r\n|\n|\r|\t)/gm, "");
			var ttt4 = Contentdata.dataValues.barber_policy.replace(/(\r\n|\n|\r|\t)/gm, "");
			var ttt5 = Contentdata.dataValues.terms_spanish.replace(/(\r\n|\n|\r|\t)/gm, "");
			var ttt6 = Contentdata.dataValues.policy_spanish.replace(/(\r\n|\n|\r|\t)/gm, "");
			Contentdata.dataValues.privacyPolicy = ttt;
			Contentdata.dataValues.termsContent = ttt2;
			Contentdata.dataValues.barber_term = ttt3;
			Contentdata.dataValues.barber_policy = ttt4;
			Contentdata.dataValues.terms_spanish = ttt5;
			Contentdata.dataValues.policy_spanish = ttt6;

			let msg = 'Content';
			jsonData.true_status(res, Contentdata, msg)

		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	subscription_setting: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
			};
			const non_required = {
				auth_key: req.headers.auth_key,

			};
			let requestdata = await helper.vaildObject(required, non_required, res);

			var Contentdata = await terms.findOne({
				attributes: [`subscription_status`, `subscription_price`],
				where: {
					status: 1,
				}
			});
			var free_trial = 0;
			if (requestdata.auth_key) {
				const data = await user.findOne({
					where: {
						auth_key: requestdata.auth_key,
					}
				});
				if (data) {
					var current_timestamp = new Date().getTime() / 1000;
					console.log(current_timestamp);

					let valid_upto = (moment(data.dataValues.createdAt).unix()) + 2592000;
					if (valid_upto > current_timestamp) {
						free_trial = 1;
					}

				}
			}
			Contentdata.dataValues.free_trial = free_trial;
			let msg = 'Subscription Setting';
			jsonData.true_status(res, Contentdata, msg)

		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	ChangePassword: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				old_password: req.body.old_password,
				new_password: req.body.new_password
			};
			const non_required = {};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				const password = crypto.createHash('sha1').update(requestdata.old_password).digest('hex');
				const data2 = await user.findOne({
					where: {
						password: password,
						auth_key: requestdata.auth_key,
					}
				});
				const get_lang = await user.findOne({
					attributes: ['language'],
					where: {
						auth_key: requestdata.auth_key,
					}
				});
				if (data2) {
					const new_password = crypto.createHash('sha1').update(requestdata.new_password).digest('hex');
					const save = await user.update({
						password: new_password,
					}, {
						where: {
							id: data.dataValues.id
						}
					});


					if (get_lang.dataValues.language == 1) {
						msg = 'Password Changed Successfully';

					} else {
						msg = "Contraseña cambiada con éxito"
					}
					var save_data = {};
					jsonData.true_status(res, save_data, msg);
				} else {
					if (get_lang.dataValues.language == 1) {
						msg = 'Current password does not matched';

					} else {
						msg = "La contraseña actual no coincide"
					}
					// let msg = '';
					jsonData.wrong_status(res, msg)
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			jsonData.wrong_status(res, errr)
		}
	},
	changenotistatus: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				status: req.body.status,   /// 1= on , 2= off
			};
			const non_required = {};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				const save = await user.update({
					notificationStatus: requestdata.status,
				}, {
					where: {
						id: data.dataValues.id
					}
				});
				let msg = "";
				if (requestdata.status == 1) {
					msg = 'Notification On';
				} else {
					msg = 'Notification Off';
				}

				var save_data = {
					status: requestdata.status
				};
				jsonData.true_status(res, save_data, msg);

			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			jsonData.wrong_status(res, errr)
		}
	},


	add_services: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				name: req.body.name,
				duration: req.body.duration,
				price: req.body.price,
			};
			const non_required = {
				category_id: req.body.category_id,
				name_spanish: req.body.name_spanish,
				description: req.body.description,
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				let barber_id = data.dataValues.id;

				save_data = {};
				save_data = requestdata;
				if (empty(requestdata.category_id)) {
					save_data.category_id = 45
				}
				save_data.barber_id = barber_id
				if (req.files && req.files.image) {
					image = await helper.image_upload(req.files.image, 'services');
					save_data.image = req.protocol + '://' + req.get('host') + '/images/services/' + image;

				}
				// console.log(save_data);
				const save = await services.create(save_data);
				if (save) {
					let msg = 'Service sucessfully saved';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	update_services: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				name: req.body.name,
				duration: req.body.duration,
				price: req.body.price,
				service_id: req.body.service_id,
			};
			const non_required = {
				category_id: req.body.category_id,
				name_spanish: req.body.name_spanish,

				description: req.body.description,
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				let barber_id = data.dataValues.id;

				save_data = {};
				save_data = requestdata;
				if (empty(requestdata.category_id)) {
					save_data.category_id = 45
				}
				save_data.barber_id = barber_id
				if (req.files && req.files.image) {
					image = await helper.image_upload(req.files.image, 'services');
					save_data.image = req.protocol + '://' + req.get('host') + '/images/services/' + image;

				}
				// console.log(save_data);
				const save = await services.update(save_data, {
					where: {
						id: requestdata.service_id
					}
				});
				if (save) {
					let msg = 'Service updated sucessfully ';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	barber_services: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				var barber_id = data.dataValues.id;

				// console.log(save_data);
				if (data.dataValues.language == 1) {
					att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
				} else {
					att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
						[sequelize.literal('name_spanish'), 'name'],
					]
				}

				const all_Services = await services.findAll({
					attributes: att,
					where: {
						barber_id: barber_id
					}
				});
				if (all_Services) {
					let msg = 'Services List ';
					jsonData.true_status(res, all_Services, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	/*time_slots: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
				date: req.body.date,
			};
			const non_required = { 
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {				
				const time_slots = await barbers_time_slot.findAll({
					where:{
						barber_id: requestdata.barber_id

					}
				});
				var final=[];

				if(time_slots){
					for(time_slot of time_slots){
						// console.log(time_slot.dataValues.slot_id);
						// return;
						var check_slot= await orders.findOne({
							where :{
								barber_id:requestdata.barber_id,
								date:requestdata.date,
								slot_id:time_slot.dataValues.slot_id,
								status:[3,4]
							}
						});
						if(check_slot){
							time_slot.dataValues.Availability=0;
						}else{
							time_slot.dataValues.Availability=1;
						}

					final.push(time_slot);
					}
				}
				if (time_slots) {         
					let msg = 'Slot List ';
					jsonData.true_status(res,final, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr,"--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},*/
	// all_time_slots: async function (req, res) {
	// 	try {
	// 		const required = {
	// 			security_key: req.headers.security_key,
	// 			auth_key: req.headers.auth_key,

	// 		};
	// 		const non_required = { 
	// 		};

	// 		let requestdata = await helper.vaildObject(required, non_required, res);

	// 		const data = await user.findOne({
	// 			where: {
	// 				auth_key: requestdata.auth_key,
	// 			}
	// 		});

	// 		if (data) {

	// 			const first = await barbers_time_slot.findAll({
	// 				// attributes: ['id','slot_id','start_time','end_time','is_close'],				

	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :1
	// 				}
	// 			});
	// 			var final=[];

	// 			slot={};
	// 			if(first.length>0){
	// 				// console.log(first);
	// 				slot=first[0];

	// 				first[0].dataValues.end_time=first[first.length-1].dataValues.end_time;	
	// 				// console.log(first[first.length-1].dataValues.end_time);
	// 				slot.dataValues.day='Monday';
	// 				slot.dataValues.all_slots=await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			

	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :1
	// 					}
	// 				});

	// 			}
	// 			final.push(slot);
	// 			slot={};

	// 			var seconds = await barbers_time_slot.findAll({
	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :2
	// 				}
	// 			});
	// 			if(seconds.length>0){
	// 				// console.log(seconds);
	// 				seconds[0].dataValues.end_time=seconds[seconds.length-1].dataValues.end_time;	
	// 				// console.log(seconds[seconds.length-1].dataValues.end_time);
	// 				slot=seconds[0];
	// 				slot.dataValues.day='Tuesday';
	// 				slot.dataValues.all_slots= await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			
	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :2
	// 					}
	// 				});

	// 			}
	// 			final.push(slot);
	// 			slot={};

	// 			var third = await barbers_time_slot.findAll({
	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :3
	// 				}
	// 			});

	// 			if(third.length>0){
	// 				// console.log(third);
	// 				third[0].dataValues.end_time=third[third.length-1].dataValues.end_time;	
	// 				// console.log(third[third.length-1].dataValues.end_time);
	// 				slot=third[0];
	// 				slot.dataValues.day='Wednesday';
	// 				slot.dataValues.all_slots=await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			
	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :3
	// 					}
	// 				});

	// 			}
	// 			final.push(slot);

	// 			slot={};
	// 			var fourth = await barbers_time_slot.findAll({
	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :4
	// 				}
	// 			});
	// 			// final.push(slot);
	// 			slot={};

	// 			if(fourth.length>0){
	// 				// console.log(fourth);
	// 				fourth[0].dataValues.end_time=fourth[fourth.length-1].dataValues.end_time;	
	// 				// console.log(fourth[fourth.length-1].dataValues.end_time);
	// 				slot=fourth[0];
	// 				slot.dataValues.day='Thursday';
	// 				slot.dataValues.all_slots=await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			
	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :4
	// 					}
	// 				});
	// 			}
	// 			final.push(slot);

	// 			slot={};

	// 			var fifth = await barbers_time_slot.findAll({
	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :5
	// 				}
	// 			});
	// 			if(fifth.length>0){
	// 				// console.log(fifth);
	// 				fifth[0].dataValues.end_time=fifth[fifth.length-1].dataValues.end_time;	
	// 				// console.log(fifth[fifth.length-1].dataValues.end_time);
	// 				slot=fifth[0];
	// 				slot.dataValues.day='Friday';
	// 				slot.dataValues.all_slots=await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			
	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :5
	// 					}
	// 				});
	// 			}
	// 			final.push(slot);
	// 			slot={};

	// 			var sixth = await barbers_time_slot.findAll({
	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :6
	// 				}
	// 			});

	// 			if(sixth.length>0){
	// 				// console.log(sixth);
	// 				sixth[0].dataValues.end_time=sixth[sixth.length-1].dataValues.end_time;	
	// 				// console.log(sixth[sixth.length-1].dataValues.end_time);
	// 				slot=sixth[0];
	// 				slot.dataValues.day='Saturday';
	// 				slot.dataValues.all_slots= await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			
	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :6
	// 					}
	// 				});
	// 			}
	// 			final.push(slot);

	// 			slot={};
	// 			var seven = await barbers_time_slot.findAll({
	// 				where:{						
	// 					barber_id: data.dataValues.id,
	// 					day :7
	// 				}
	// 			});

	// 			if(seven.length>0){
	// 				// console.log(seven);
	// 				seven[0].dataValues.end_time=seven[seven.length-1].dataValues.end_time;	
	// 				// console.log(seven[seven.length-1].dataValues.end_time);
	// 				slot=seven[0];
	// 				slot.dataValues.day='Sunday';
	// 				slot.dataValues.all_slots=await barbers_time_slot.findAll({
	// 					attributes: ['id','slot_id','start_time','end_time','is_close'],			
	// 					where:{						
	// 						barber_id: data.dataValues.id,
	// 						day :7
	// 					}
	// 				});
	// 			}
	// 			final.push(slot);
	// 			if (final) {         
	// 				let msg = 'All slots ';
	// 				jsonData.true_status(res,final, msg);
	// 			} else {
	// 				let msg = 'Try Again Somthing Wrong';
	// 				jsonData.true_status(res, msg);
	// 			}


	// 		} else {
	// 			let msg = 'Invalid authorization key';
	// 			jsonData.invalid_status(res, msg)
	// 		}
	// 	} catch (errr) {
	// 		console.log(errr,"--------------------errr-----------");
	// 		jsonData.wrong_status(res, errr)
	// 	}
	// },
	all_time_slots_: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				date: req.body.date,

			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			s = moment.unix(requestdata.date).day();

			// day=s.day();
			// console.log( s);
			// return;
			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {

				const first = await barbers_time_slot.findAll({
					// attributes: ['id','slot_id','start_time','end_time','is_close'],				

					where: {
						barber_id: data.dataValues.id,
						day: s
					}
				});
				var final = [];

				slot = {};
				if (first.length > 0) {
					// console.log(first);
					slot = first[0];

					first[0].dataValues.end_time = first[first.length - 1].dataValues.end_time;
					// console.log(first[first.length-1].dataValues.end_time);

					if (s == 1) {
						slot.dataValues.day = 'Monday';
					} else if (s == 2) {
						slot.dataValues.day = 'Tuesday';
					} else if (s == 3) {
						slot.dataValues.day = 'Wednesday';
					} else if (s == 4) {
						slot.dataValues.day = 'Thursday';
					} else if (s == 5) {
						slot.dataValues.day = 'Friday';
					} else if (s == 6) {
						slot.dataValues.day = 'Saturday';
					} else if (s == 7) {
						slot.dataValues.day = 'Sunday';
					}
					slot.dataValues.all_slots = await barbers_time_slot.findAll({
						attributes: ['id', 'slot_id', 'start_time', 'end_time', 'is_close'],

						where: {
							barber_id: data.dataValues.id,
							day: s
						}
					});

				}
				final.push(slot);
				/*slot={};

				var seconds = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :2
					}
				});
				if(seconds.length>0){
					// console.log(seconds);
					seconds[0].dataValues.end_time=seconds[seconds.length-1].dataValues.end_time;	
					// console.log(seconds[seconds.length-1].dataValues.end_time);
					slot=seconds[0];
					slot.dataValues.day='Tuesday';
					slot.dataValues.all_slots= await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :2
						}
					});

				}
				final.push(slot);
				slot={};

				var third = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :3
					}
				});

				if(third.length>0){
					// console.log(third);
					third[0].dataValues.end_time=third[third.length-1].dataValues.end_time;	
					// console.log(third[third.length-1].dataValues.end_time);
					slot=third[0];
					slot.dataValues.day='Wednesday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :3
						}
					});

				}
				final.push(slot);

				slot={};
				var fourth = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :4
					}
				});
				// final.push(slot);
				slot={};
				
				if(fourth.length>0){
					// console.log(fourth);
					fourth[0].dataValues.end_time=fourth[fourth.length-1].dataValues.end_time;	
					// console.log(fourth[fourth.length-1].dataValues.end_time);
					slot=fourth[0];
					slot.dataValues.day='Thursday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :4
						}
					});
				}
				final.push(slot);

				slot={};

				var fifth = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :5
					}
				});
				if(fifth.length>0){
					// console.log(fifth);
					fifth[0].dataValues.end_time=fifth[fifth.length-1].dataValues.end_time;	
					// console.log(fifth[fifth.length-1].dataValues.end_time);
					slot=fifth[0];
					slot.dataValues.day='Friday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :5
						}
					});
				}
				final.push(slot);
				slot={};

				var sixth = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :6
					}
				});
				
				if(sixth.length>0){
					// console.log(sixth);
					sixth[0].dataValues.end_time=sixth[sixth.length-1].dataValues.end_time;	
					// console.log(sixth[sixth.length-1].dataValues.end_time);
					slot=sixth[0];
					slot.dataValues.day='Saturday';
					slot.dataValues.all_slots= await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :6
						}
					});
				}
				final.push(slot);

				slot={};
				var seven = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :7
					}
				});
				
				if(seven.length>0){
					// console.log(seven);
					seven[0].dataValues.end_time=seven[seven.length-1].dataValues.end_time;	
					// console.log(seven[seven.length-1].dataValues.end_time);
					slot=seven[0];
					slot.dataValues.day='Sunday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :7
						}
					});
				}
				final.push(slot);*/
				if (final) {
					let msg = 'All slots ';
					jsonData.true_status(res, slot, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	all_time_slots: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				date: req.body.date,

			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			s = moment.unix(requestdata.date).day();

			// day=s.day();
			// console.log( s);
			// return;
			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {

				const first = await barbers_time_slot.findAll({
					// attributes: ['id','slot_id','start_time','end_time','is_close'],				

					where: {
						barber_id: data.dataValues.id,
						day: s
					}
				});
				var final = [];

				slot = {};
				if (first.length > 0) {
					// console.log(first);
					slot = first[0];

					first[0].dataValues.end_time = first[first.length - 1].dataValues.end_time;
					// console.log(first[first.length-1].dataValues.end_time);

					if (s == 1) {
						slot.dataValues.day = 'Monday';
					} else if (s == 2) {
						slot.dataValues.day = 'Tuesday';
					} else if (s == 3) {
						slot.dataValues.day = 'Wednesday';
					} else if (s == 4) {
						slot.dataValues.day = 'Thursday';
					} else if (s == 5) {
						slot.dataValues.day = 'Friday';
					} else if (s == 6) {
						slot.dataValues.day = 'Saturday';
					} else if (s == 7) {
						slot.dataValues.day = 'Sunday';
					}

					const check_block_date = await block_dates.findOne({
						where: {
							barber_id: data.dataValues.id,
							block_date: requestdata.date,
						}
					});
					if (!check_block_date && empty(check_block_date)) {
						slot.dataValues.block_whole_day = 0;

					} else {
						slot.dataValues.block_whole_day = 1;

					}
					slot.dataValues.all_slots = await barbers_time_slot.findAll({
						attributes: ['id', 'slot_id', 'start_time', 'end_time', 'is_close'],

						where: {
							barber_id: data.dataValues.id,
							day: s
						}
					});

				}
				final.push(slot);
				/*slot={};

				var seconds = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :2
					}
				});
				if(seconds.length>0){
					// console.log(seconds);
					seconds[0].dataValues.end_time=seconds[seconds.length-1].dataValues.end_time;	
					// console.log(seconds[seconds.length-1].dataValues.end_time);
					slot=seconds[0];
					slot.dataValues.day='Tuesday';
					slot.dataValues.all_slots= await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :2
						}
					});

				}
				final.push(slot);
				slot={};

				var third = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :3
					}
				});

				if(third.length>0){
					// console.log(third);
					third[0].dataValues.end_time=third[third.length-1].dataValues.end_time;	
					// console.log(third[third.length-1].dataValues.end_time);
					slot=third[0];
					slot.dataValues.day='Wednesday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :3
						}
					});

				}
				final.push(slot);

				slot={};
				var fourth = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :4
					}
				});
				// final.push(slot);
				slot={};
				
				if(fourth.length>0){
					// console.log(fourth);
					fourth[0].dataValues.end_time=fourth[fourth.length-1].dataValues.end_time;	
					// console.log(fourth[fourth.length-1].dataValues.end_time);
					slot=fourth[0];
					slot.dataValues.day='Thursday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :4
						}
					});
				}
				final.push(slot);

				slot={};

				var fifth = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :5
					}
				});
				if(fifth.length>0){
					// console.log(fifth);
					fifth[0].dataValues.end_time=fifth[fifth.length-1].dataValues.end_time;	
					// console.log(fifth[fifth.length-1].dataValues.end_time);
					slot=fifth[0];
					slot.dataValues.day='Friday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :5
						}
					});
				}
				final.push(slot);
				slot={};

				var sixth = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :6
					}
				});
				
				if(sixth.length>0){
					// console.log(sixth);
					sixth[0].dataValues.end_time=sixth[sixth.length-1].dataValues.end_time;	
					// console.log(sixth[sixth.length-1].dataValues.end_time);
					slot=sixth[0];
					slot.dataValues.day='Saturday';
					slot.dataValues.all_slots= await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :6
						}
					});
				}
				final.push(slot);

				slot={};
				var seven = await barbers_time_slot.findAll({
					where:{						
						barber_id: data.dataValues.id,
						day :7
					}
				});
				
				if(seven.length>0){
					// console.log(seven);
					seven[0].dataValues.end_time=seven[seven.length-1].dataValues.end_time;	
					// console.log(seven[seven.length-1].dataValues.end_time);
					slot=seven[0];
					slot.dataValues.day='Sunday';
					slot.dataValues.all_slots=await barbers_time_slot.findAll({
						attributes: ['id','slot_id','start_time','end_time','is_close'],			
						where:{						
							barber_id: data.dataValues.id,
							day :7
						}
					});
				}
				final.push(slot);*/
				if (final) {
					let msg = 'All slots ';
					jsonData.true_status(res, slot, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	time_slots: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
				date: req.body.date,

			};
			const non_required = {
				current_timestamp: req.body.current_timestamp,
			};


			let requestdata = await helper.vaildObject(required, non_required, res);
			// console.log(day);
			// return;
			console.log(moment.utc().format('YYYY-MM-DD HH:mm:ss'));

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			var final = [];

			if (data) {
				console.log(requestdata.current_timestamp);
				const check_block_date = await block_dates.findOne({
					where: {
						barber_id: requestdata.barber_id,
						block_date: requestdata.date,
					}
				});
				if (!check_block_date && empty(check_block_date)) {
					if (requestdata.current_timestamp) {
						requestdata.day = moment().day();

						var currentTime = moment();
						var abc = moment(currentTime).format("HH:mm")
						time_array = abc.split(':');

						requestdata.current_timestamp = (time_array[0] * 3600) + (time_array[1] * 60);
						console.log(requestdata.current_timestamp);
						var time_slots = await barbers_time_slot.findAll({
							where: {
								barber_id: requestdata.barber_id,
								day: requestdata.day,
								is_close: 0,
								start_time_seconds: { [Op.gt]: requestdata.current_timestamp }

							}
						});
					} else {
						s = moment.unix(requestdata.date).day();

						var time_slots = await barbers_time_slot.findAll({
							where: {
								is_close: 0,
								day: s,
								barber_id: requestdata.barber_id

							}
						});
					}

					console.log(time_slots);
					var check_slot = await orders.findAll({
						attributes: ['id', 'slot_id'],
						where: {
							barber_id: requestdata.barber_id,
							date: requestdata.date,
							// slot_id:time_slot.dataValues.slot_id,
							status: [1, 3, 4]
						}
					});
					slot_id_s_Array = [];
					var booked_time_slots;
					if (check_slot.length > 0) {
						for (i = 0; i < check_slot.length; i++) {
							if (i == 0) {
								booked_time_slots = check_slot[i]['slot_id'];

							} else {
								booked_time_slots = booked_time_slots + ',' + check_slot[i]['slot_id'];
							}
						}
						console.log(booked_time_slots);
						slot_id_s_Array = JSON.parse("[" + booked_time_slots + "]");
						console.log(slot_id_s_Array);
					}

					if (time_slots) {
						for (time_slot of time_slots) {
							// console.log(time_slot.dataValues.slot_id);
							// return;
							if (slot_id_s_Array.indexOf(time_slot.dataValues.slot_id) !== -1) {
								// throw "Current Time slot is booked by another user";							        
							} else {
								final.push(time_slot);

							}
						}
					}
				}
				const barber_data = await user.findOne({
					where: {
						id: requestdata.barber_id,
					}
				});

				set = {};
				set.reward_percentage = barber_data.dataValues.reward_percentage;
				set.reward_order_count = barber_data.dataValues.reward_order_count;
				all_completed_order = await orders.findAndCountAll({
					attributes: ['id'],
					where: {
						is_rewarded: 0,
						status: [3, 4],
						barber_id: requestdata.barber_id,
						user_id: data.dataValues.id,
					}
				});
				set.completed_order = all_completed_order.count;
				set.time_slots = final;
				// if (time_slots) {         
				let msg = 'Slot List ';
				jsonData.true_status(res, set, msg);
				/*} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}*/


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	services_with_time_slot: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {

				// console.log(save_data);
				const all_Services = await services.findAll({
					where: {
						barber_id: requestdata.barber_id
					}
				});
				const time_slots = await barbers_time_slot.findAll({
					where: {
						barber_id: requestdata.barber_id

					}
				});
				var final = {};
				final.all_Services = all_Services;
				final.time_slots = time_slots;
				if (all_Services) {
					let msg = 'Services List ';
					jsonData.true_status(res, final, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	delete_services: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				service_id: req.body.service_id,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {

				const delete_services = await services.destroy({
					where: {
						id: requestdata.service_id
					}
				});
				if (delete_services) {
					let msg = 'Deleted successfully ';
					jsonData.true_status(res, msg);
				} else {
					throw 'Try Again Somthing Wrong';
					// let msg = 'Try Again Somthing Wrong';
					// jsonData.true_status(res, msg);
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	delete_profile: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			var data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				const delete_id = data.dataValues.id;
				// console.log(data.dataValues.id);
				if (data.dataValues.user_type == 2) {
					/*var all_orders= await orders.findAll({
							where :{
								barber_id:delete_id								
							}
					});
					if(all_orders.length>0){*/
					// console.log(data.dataValues.id);
					// return;
					const delete_barber_order = await orders.destroy({
						where: {
							barber_id: delete_id
						}
					});
					// }
				} else {
					/*var all_orders= await orders.findAll({
							where :{
								user_id:delete_id							
							}
					});
					if(all_orders.length>0){*/
					const delete_user_order = await orders.destroy({
						where: {
							user_id: delete_id
						}
					});
					// }
				}


				const delete_services = await user.destroy({
					where: {
						id: delete_id
					}
				});
				if (delete_services) {
					let msg = 'Deleted successfully ';
					jsonData.true_status(res, msg);
				} else {
					throw 'Try Again Somthing Wrong';
					// let msg = 'Try Again Somthing Wrong';
					// jsonData.true_status(res, msg);
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},

	fav_list: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let user_id = userdata.dataValues.id;
				const all_fav = await likes.findAll({
					attributes: ['id', 'createdAt'],
					include: [{
						model: barber,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
					where: {
						user_id: user_id,
						status: 1
					}
				});
				var finaldata = [];
				if (all_fav) {
					for (var detail of all_fav) {
						if (detail.dataValues.barber) {
							finaldata.push(detail);
						}
						// console.log(detail);
						// return;
						// detail.dataValues.barber.dataValues.profile_image= req.protocol + '://' + req.get('host') + '/images/users/' + detail.dataValues.barber.dataValues.profile_image;
					}
				}

				let msg = 'Fav Barber list';
				jsonData.true_status(res, finaldata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	userlist: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let userid = userdata.dataValues.id;
				// const finduser=await connections.findAll({})
				const user_data = await user.findAll({
					attributes: [`id`, `username`, 'profile_image',
						[sequelize.literal('(SELECT case when ifnull(count(*),0)= 0 then 0 else 1 end FROM `connections` WHERE `senderId`=' + userid + ')'), 'is_following'],
						[sequelize.literal('(SELECT case when ifnull(count(*),0)= 0 then 0 else 1 end  FROM `connections` WHERE `senderId`=' + userid + ' and `receiverId`=users.id)'), 'is_followers'],
					],
					where: {
						[Op.and]: [
							sequelize.literal('status=1'),
							sequelize.literal('id!=' + userid),
						]
					}
				});
				let msg = 'User list';
				jsonData.true_status(res, user_data, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	myprofile: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let userid = userdata.dataValues.id;
				let user_data = await user.findOne({
					attributes: [`id`, `username`, `profile_image`, `phone`, `email`, `Country`, `dob`, `gender`, `state`, `city`, `age`, `notification_status`, `lat`, `lng`, `loginType`, `auth_key`, `device_type`, `device_token`, `socialId`,
						[sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `senderId`=' + userid + ')'), 'following'],
						[sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `receiverId`=' + userid + ')'), 'followers'],
						[sequelize.literal('(SELECT ifnull(count(*),0) FROM `posts` WHERE status=1 and `userId`=' + userid + ')'), 'postcount'],
					],
					where: {
						[Op.and]: [
							sequelize.literal('status=1'),
							sequelize.literal('id=' + userid),
						]
					}
				});
				let postdata = await posts.findAll({
					attributes: [`id`, `userId`, `catId`, `description`, `status`,
						[sequelize.literal('UNIX_TIMESTAMP(posts.createdAt)'), 'createdAt'],
						[sequelize.literal('(SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)'), 'totalvote'],
						[sequelize.literal('(SELECT case when `profile_image`="" then "" else  CONCAT("http://' + req.get('host') + '/images/users/", profile_image) end as userimage FROM users where id = posts.userId)'), 'userimage'],
						[sequelize.literal('(SELECT username FROM users where id = posts.userId)'), 'username'],
						[sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `postId`=posts.id and userId=' + userid + ')'), 'is_vote'],
					],
					where: {
						status: 1,
						userId: userid,
					},
					include: [{
						model: postsImages,
						attributes: ['id',
							[sequelize.literal('case when postsImages.`images`="" then "" else  CONCAT("http://' + req.get('host') + '/images/post/", postsImages.images) end'), 'images'],
							[sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `imageId`=postsImages.id and userId=' + userid + ')'), 'is_imagevote'],
							[sequelize.literal('(SELECT  ifnull(count(*),0) as count FROM `votecasting` WHERE `imageId`=postsImages.id)'), 'imagevote'],
							[sequelize.literal('(SELECT ifnull(round((((SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `imageId`=postsImages.id) / (SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)) * 100),2),0) )'), 'percentage'],
						],
						on: {
							col1: sequelize.where(sequelize.col('postsImages.postId'), '=', sequelize.col('posts.id')),
						},
					}],
				});
				let finaldata = {
					userdetail: user_data,
					postdata: postdata
				}
				let msg = 'My profile';
				jsonData.true_status(res, finaldata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	otheruserprofile: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				userid: req.query.userid,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			let userid = requestdata.userid
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let loginuserid = userdata.dataValues.id
				let user_data = await user.findOne({
					attributes: [`id`, `username`, `profile_image`, `phone`, `email`, `Country`, `dob`, `gender`, `state`, `city`, `age`, `notification_status`, `lat`, `lng`, `loginType`, `auth_key`, `device_type`, `device_token`, `socialId`,
						[sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `senderId`=' + userid + ')'), 'following'],
						[sequelize.literal('(SELECT case when ifnull(count(*),0)=0 then 0 else 1 end FROM `connections` WHERE `senderId`=' + userid + ' and `receiverId`=' + loginuserid + ' )'), 'is_following'],
						[sequelize.literal('(SELECT ifnull(count(*),0) FROM `connections` WHERE `receiverId`=' + userid + ')'), 'followers'],
						[sequelize.literal('(SELECT case when ifnull(count(*),0)=0 then 0 else 1 end FROM `connections` WHERE `receiverId`=' + userid + ' and `senderId`=' + loginuserid + ' )'), 'is_followers'],
						[sequelize.literal('(SELECT ifnull(count(*),0) FROM `posts` WHERE status=1 and `userId`=' + userid + ')'), 'postcount'],
					],
					where: {
						[Op.and]: [
							sequelize.literal('status=1'),
							sequelize.literal('id=' + userid),
						]
					}
				});
				let postdata = await posts.findAll({
					attributes: [`id`, `userId`, `catId`, `description`, `status`,
						[sequelize.literal('UNIX_TIMESTAMP(posts.createdAt)'), 'createdAt'],
						[sequelize.literal('(SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)'), 'totalvote'],
						[sequelize.literal('(SELECT case when `profile_image`="" then "" else  CONCAT("http://' + req.get('host') + '/images/users/", profile_image) end as userimage FROM users where id = posts.userId)'), 'userimage'],
						[sequelize.literal('(SELECT username FROM users where id = posts.userId)'), 'username'],
						[sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `postId`=posts.id and userId=' + loginuserid + ')'), 'is_vote'],
					],
					where: {
						status: 1,
						userId: userid,
					},
					include: [{
						model: postsImages,
						attributes: ['id',
							[sequelize.literal('case when postsImages.`images`="" then "" else  CONCAT("http://' + req.get('host') + '/images/post/", postsImages.images) end'), 'images'],
							[sequelize.literal('(SELECT case when ifnull(count(*),0) = 0 then 0 else 1 end as count FROM `votecasting` WHERE `imageId`=postsImages.id and userId=' + loginuserid + ')'), 'is_imagevote'],
							[sequelize.literal('(SELECT  ifnull(count(*),0) as count FROM `votecasting` WHERE `imageId`=postsImages.id)'), 'imagevote'],
							[sequelize.literal('(SELECT ifnull(round((((SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `imageId`=postsImages.id) / (SELECT ifnull(count(*),0)as count FROM `votecasting` WHERE `postId`=posts.id)) * 100),2),0) )'), 'percentage'],
						],
						on: {
							col1: sequelize.where(sequelize.col('postsImages.postId'), '=', sequelize.col('posts.id')),
						},
					}],
				});
				let finaldata = {
					userdetail: user_data,
					postdata: postdata
				}
				let msg = 'Other User profile';
				jsonData.true_status(res, finaldata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	followerslist: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let userid = userdata.dataValues.id;
				var getfollowerslist = await user.sequelize.query('select id,username,profile_image from users where id in (SELECT senderId FROM `connections` WHERE `receiverId`=' + userid + ')', {
					type: sequelize.QueryTypes.SELECT
				});

				let msg = 'Followers User list';
				jsonData.true_status(res, getfollowerslist, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	followinglist: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let userid = userdata.dataValues.id;
				var getfollowinglist = await user.sequelize.query('select id,username,profile_image from users where id in (SELECT receiverId FROM `connections` WHERE `senderId`=' + userid + ')', {
					type: sequelize.QueryTypes.SELECT
				});

				let msg = 'Following User list';
				jsonData.true_status(res, getfollowinglist, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	notifiactionlist: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (user_data) {
				var userId = user_data.dataValues.id
				var notifcation_data = await notifcation.findAll({
					attributes: [`id`, `senderId`, `recieverId`, `data`, `notiType`, `message`, `isRead`, `createdAt`,
						[sequelize.literal('(select username from users where id=notifcations.senderId)'), 'username'],
						[sequelize.literal('(select profile_image from users where id=notifcations.senderId)'), 'userImage'],
						[sequelize.literal('(SELECT count(*) FROM `notifcations` WHERE `recieverId`=' + userId + ' and `isRead`=0 )'), 'unreadcount'],
					],
					where: {
						recieverId: userId
					}
				});
				notifcation_data = notifcation_data.map(notification => {
					if (helper.isJson(notification.data)) {
						notification.data = JSON.parse(notification.data);
					} else {
						notification.data = {};
					}
					return notification;
				});

				let notifcationupdate = await notifcation.update({
					isRead: 1
				}, {
					where: {
						recieverId: userId
					}
				});
				let msg = 'Notification List';
				jsonData.true_status(res, notifcation_data, msg)
			} else {
				let msg = 'Invalid authorization_key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "----errr");
			jsonData.wrong_status(res, errr)
		}
	},
	follow: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				otheruserid: req.body.otheruserid,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				let userid = user_data.dataValues.id;
				const create_follow = await connection.create({
					senderId: userid,
					receiverId: requestdata.otheruserid
				});

				let msg = 'follow Successfully';
				jsonData.true_status(res, create_follow, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	unfollow: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				otheruserid: req.body.otheruserid,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				let userid = user_data.dataValues.id;
				const create_follow = await connection.destroy({
					where: {
						senderId: userid,
						receiverId: requestdata.otheruserid
					}
				});

				let msg = 'Unfollow Successfully';
				jsonData.true_status(res, create_follow, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	add_feed: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				/* name: req.body.name,
				   category_id: req.body.category_id,
				   barber_id: req.body.barber_id,
				   price: req.body.price,*/
				description: req.body.description,

			};
			const non_required = {

			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				let user_id = data.dataValues.id;

				save_data = {};
				save_data = requestdata;
				save_data.user_id = user_id
				if (req.files && req.files.image) {
					image = await helper.image_upload(req.files.image, 'services');
					save_data.image = req.protocol + '://' + req.get('host') + '/images/services/' + image;
				}
				// console.log(save_data);
				const save = await feeds.create(save_data);
				if (save) {
					let msg = 'Feed sucessfully saved';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	feeds: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let user_id = userdata.dataValues.id;
				const all_fav = await feeds.findAll({
					// attributes:['id','createdAt'],
					include: [{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
					// where: {
					// 	// user_id: user_id,
					// 	// status:1
					// },
					order: [
						['id', 'DESC'],
					]
				});
				var finaldata = [];
				if (all_fav) {
					for (var detail of all_fav) {
						// console.log(detail);
						// return;
						// detail.dataValues.barber.dataValues.profile_image= req.protocol + '://' + req.get('host') + '/images/users/' + detail.dataValues.barber.dataValues.profile_image;
						finaldata.push(detail);
					}
				}

				let msg = 'Feeds list';
				jsonData.true_status(res, all_fav, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},

	barber_profile: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
			};
			const non_required = {
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});


			if (data) {
				const get_lang = await user.findOne({
					attributes: ['language'],
					where: {
						auth_key: requestdata.auth_key,
					}
				});

				if (get_lang.dataValues.language == 1) {
					att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
				} else {
					att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
						[sequelize.literal('name_spanish'), 'name'],
					]
				}
				const profile = await barber.findOne({
					attributes: [`id`, `avg_rating`, `language`, `username`, `profile_image`, `phone`, `email`, `lat`, `lng`, `address`, `description`, `access_token`, `schedule`],
					include: [{
						model: services,
						attributes: att,
					}],
					where: {
						id: requestdata.barber_id,
					}
				});
				if (profile.dataValues.schedule) {

					profile.dataValues.schedule = JSON.parse(profile.dataValues.schedule);
				} else {
					profile.dataValues.schedule = [];
				}
				let msg = 'Barber details';
				jsonData.true_status(res, profile, msg)

			}
			else {
				let msg = 'Invalid authorization';
				jsonData.wrong_status(res, msg)
			}
		}
		catch (error) {
			console.log(error);
			jsonData.wrong_status(res, error)
		}
	},
	barber_list: async function (req, res) {
		try {
			// console.log(req);
			// return;
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				category_id: req.body.category_id
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);

			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				user_id = userdata.dataValues.id;
				const all_barbers = await services.findAll({
					attributes: ['id', 'createdAt'],
					group: ['barber_id'],
					include: [{
						model: barber,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating', 'lat', 'lng', 'address'],
					}],
					where: {
						category_id: requestdata.category_id,
						status: 1
					}
				});
				var finaldata = [];
				if (!empty(all_barbers)) {
					console.log(all_barbers);
					for (let barber of all_barbers) {
						// console.log(barber);
						// return;
						if (!empty(barber.dataValues.barber)) {


							let is_fav = await likes.findOne({
								where: {
									barber_id: barber.dataValues.barber.dataValues.id,
									user_id: user_id
								}
							});
							if (barber.dataValues.barber.dataValues.profile_image) {
								// barber.dataValues.barber.dataValues.profile_image = req.protocol + '://' + req.get('host') + '/images/users/' + barber.dataValues.barber.dataValues.profile_image;
							}

							var barber_data = barber.dataValues.barber.dataValues;
							// barber_data.is_rated=0;
							if (is_fav) {
								barber_data.is_fav = 1;
							} else {
								barber_data.is_fav = 0;
							}
							finaldata.push(barber_data);
						}
					}
				}

				let msg = 'Barber list';
				jsonData.true_status(res, finaldata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			console.log(error);
			jsonData.wrong_status(res, error)
		}
	},
	book_barber: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
				date: req.body.date,
				slot_id: req.body.slot_id,
				no_slots: req.body.no_slots,

				total_amount: req.body.total_amount,
				services: req.body.services,
			};
			const non_required = {
				info: req.body.info,
				is_self: req.body.is_self,
				is_rewarded: req.body.is_rewarded,// send 2 if you want to use        
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				user_id = userdata.dataValues.id;
				array_slot_id = [];
				requestdata.no_slots = parseInt(requestdata.no_slots) - 1;
				if (parseInt(requestdata.no_slots) > 0) {
					slot_count = parseInt(requestdata.slot_id) + parseInt(requestdata.no_slots);
				} else {
					slot_count = 1;
				}
				slot_count_to_store = 0;

				var check_slot = await orders.findAll({
					where: {
						barber_id: requestdata.barber_id,
						date: requestdata.date,
						/*slot_id:{
							[Op.like]: '%'+i+'%'
						},*/
						status: [1, 3, 4]
					}
				});
				/*for (var i = parseInt(requestdata.slot_id); i <= slot_count  ; i++) {
					// console.log(i+'sdfsd');
					// return;
					
					slot_count_to_store++;
					array_slot_id.push(i);

				}
				*/
				// console.log('Here i am no2');
				// console.log(check_slot);
				booking_day = moment.unix(requestdata.date).day();
				console.log(booking_day);
				const get_lang = await user.findOne({
					attributes: ['language'],
					where: {
						auth_key: requestdata.auth_key,
					}
				});
				if (check_slot.length > 0) {
					// console.log('Here i am');

					for (i = 0; i < check_slot.length; i++) {
						// console.log(check_slot[i]['slot_id']);
						if (check_slot[i]['slot_id']) {
							var slot_id_s_Array = JSON.parse("[" + check_slot[i]['slot_id'] + "]");
							array_slot_id = [];

							for (var j = parseInt(requestdata.slot_id); j <= slot_count; j++) {
								console.log(j);
								var bookin_slot = await barbers_time_slot.findOne({
									attributes: ['id'],
									where: {
										barber_id: requestdata.barber_id,
										slot_id: j,
										day: booking_day
									}
								});

								if (empty(bookin_slot)) {
									console.log(bookin_slot + 'sdfsd');
									// return;


									if (get_lang.dataValues.language == 1) {
										throw "Invalid slot selection";
									} else {
										throw "Selección de espacio no válida";
									}
									// throw "Invalid slot selection";						        

								}

								if (slot_id_s_Array.indexOf(j) !== -1) {
									if (get_lang.dataValues.language == 1) {
										throw "Time slot is already booked, please try any other slot.";

									} else {
										throw "La franja horaria ya está reservada, pruebe con otra franja horaria.";
									}
								}
								slot_count_to_store++;
								array_slot_id.push(j);
							}
						}
					}
				} else {

					// console.log('Here');
					slot_count_to_store = 0;

					for (var i = parseInt(requestdata.slot_id); i <= slot_count; i++) {
						// console.log(i+'sdfsd');
						// return;
						var bookin_slot = await barbers_time_slot.findOne({
							attributes: ['id'],
							where: {
								barber_id: requestdata.barber_id,
								slot_id: i,
								day: booking_day
							}
						});
						if (empty(bookin_slot)) {
							console.log(bookin_slot + 'Without');
							// return;
							if (get_lang.dataValues.language == 1) {
								throw "Invalid slot selection";
							} else {
								throw "Selección de espacio no válida";
							}

						}
						slot_count_to_store++;
						array_slot_id.push(i);

					}
				}
				if (array_slot_id.length > 0) {
					requestdata.slot_id = array_slot_id.toString();

				}
				console.log(array_slot_id);
				requestdata.slot_count = slot_count_to_store;
				var slot = await barbers_time_slot.findOne({
					attributes: ['id', 'slot_id', 'end_time', 'start_time_seconds'],
					where: {
						barber_id: requestdata.barber_id,
						slot_id: requestdata.slot_id
					}
				});
				var hms = slot.dataValues.end_time;   // your input string
				var a = hms.split(':'); // split it at the colons

				// minutes are worth 60 seconds. Hours are worth 60 minutes.
				var seconds = parseInt(a[0]) * 60 * 60 + parseInt(a[1]) * 60;
				var end_time = parseInt(requestdata.date) + parseInt(seconds);
				const start_time = parseInt(requestdata.date) + parseInt(slot.dataValues.start_time_seconds);
				console.log(end_time + 'endtime');
				// return;
				save_data = {};
				save_data = requestdata;
				save_data.user_id = user_id;
				save_data.end_time = end_time;
				save_data.start_time = start_time;

				if (requestdata.is_self == 1) {
					save_data.status = 3;
					save_data.type = 2;

				}

				const save = await orders.create(save_data);
				if (save) {
					var order_id = save.dataValues.id;
					const services = requestdata.services.split(',');
					if (services) {

						var save_order_services = [];
						// for(service in services){
						for (i = 0; i < services.length; i++) {

							// console.log(service);
							// return;
							var order_service = {};
							order_service.order_id = order_id;
							order_service.service_id = services[i];
							save_order_services.push(order_service);
						}

						// console.log(save_order_services);
						// return;
						order_services.bulkCreate(save_order_services);
						if (requestdata.is_self == 1) {


						} else {
							const push_data = {};
							push_data.sent_to_id = requestdata.barber_id;
							push_data.notification_code = 1111;
							push_data.sent_data = save;
							push_data.body = userdata.dataValues.username + ' sent you a appointment request';
							await helper.Notification(push_data);
						}

					}

					let msg = 'Request sent to barber';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	barber_requests: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				return_type: 2
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			var barber_id = requestdata.barber_id;

			// console.log(barber_id);
			const all_requests = await orders.findAll({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
				where: {
					status: [0, 1, 2],
					is_self: 0,
					barber_id: barber_id
				},
				order: [
					['id', 'DESC'],
				]
			});
			var final_sent = [];

			if (all_requests) {
				for (request of all_requests) {
					var slot_id_s_Array = JSON.parse("[" + request.dataValues.slot_id + "]");

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: barber_id,
							slot_id: slot_id_s_Array
						}
					});

					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}

					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
								// [Op.in]: [
								//     {id :array_Service }
								// ]
								// id: { $in: array_Service }
							}
						})
					}
					sent = {}
					// sent=request;
					sent.request = request;
					sent.user = request.dataValues.user.dataValues;
					delete request.dataValues.user.dataValues;
					sent.slot_Detail = slot;

					sent.services_detail = all_Services;

					// console.log(all_Services);
					// return;
					final_sent.push(sent);


				}
			}
			// console.log(all_requests);

			let msg = 'All requests ';
			jsonData.true_status(res, final_sent, msg);

		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	request_sent_to_barber: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				return_type: 1,

			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);



			// console.log(barber_id);
			const all_requests = await orders.findAll({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: barber,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
				where: {
					user_id: requestdata.user_id,
					status: [0, 1, 2],
				},
				order: [
					['id', 'DESC'],
				]
			});
			// console.log(all_requests);
			// return;
			var final_sent = [];

			if (all_requests) {
				for (request of all_requests) {
					var slot_id_s_Array = JSON.parse("[" + request.dataValues.slot_id + "]");

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: request.dataValues.barber_id,
							slot_id: slot_id_s_Array
						}
					});
					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}
					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
								// [Op.in]: [
								//     {id :array_Service }
								// ]
								// id: { $in: array_Service }
							}
						})
					}
					sent = {}
					// sent=request;
					sent.request = request;
					sent.user = request.dataValues.barber.dataValues;
					delete request.dataValues.barber.dataValues;
					sent.slot_Detail = slot;
					sent.services_detail = all_Services;
					// console.log(all_Services);
					// return;
					final_sent.push(sent);


				}
			}
			// console.log(all_requests);

			let msg = 'All requests ';
			jsonData.true_status(res, final_sent, msg);
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},


	oauth: async function (req, res) {

		// console.log(req);
		await superagent
			.post('https://connect.squareup.com/oauth2/token')
			.send({
				// client_id: 'sandbox-sq0idb-nllUHLfpANX_XRfWx2ENxw',
				// client_secret:'sandbox-sq0csb-G7v_m4fEcZ6GZqUptLITKnrE5j4-vDzw2poC0VmEQKQ',
				client_id: 'sq0idp-f461Wa_wzlC_9Xbe1rtUlA',
				client_secret: 'sq0csp-6IX_o0D739OeudW9Hi7KSdTckSbVzLUdI3Rha2JgFbI',

				// code:'sandbox-sq0cgb-724JRU3vslXl7qbAZViFBA',
				code: req.query.code,
				grant_type: 'authorization_code'
				// refresh_token:'EQAAEHTdffodDF7Cx8cBzElgl14QOQE4jT4YtO8Y8RATPTOXVdjOvYO8Ft_H1MiN',
				// grant_type:'refresh_token'  
			}) // sends a JSON post body
			.set('Square-Version', '2020-03-25')
			.set('Content-Type', 'application/json')
			.end((err, result_oauth) => {
				if (err) {
					console.log(err.response);
					console.log(err.response.body);
					res.statusCode = 400;
					res.setHeader('Content-Type', 'text/plain');
					res.end('Barber_Error');
				} else {
					// console.log(result_oauth);	
					// console.log(result_oauth.body);	
					var current_timestamp = new Date().getTime() / 1000;

					const save_token = user.update({
						access_token: result_oauth.body.access_token,
						refresh_token: result_oauth.body.refresh_token,
						access_token_save_time: current_timestamp

					},
						{
							where:
							{
								id: req.query.state
							}
						});
					if (save_token) {

						res.statusCode = 200;
						res.setHeader('Content-Type', 'text/plain');
						res.end('Barber_Success');
					}



				}
				// Calling the end function will send the request
			});
	},
	charity_payment: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				charity_id: req.body.charity_id,
				payment_nonce: req.body.payment_nonce,
				amount: req.body.amount,
				return_type: 1,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);


			var user_id = requestdata.user_id;
			const request = await charities.findOne({
				where: {
					id: requestdata.charity_id,
				}
			});
			// var final_sent=[];
			sent = {}
			if (request) {
				var _amount = requestdata.amount * 100;
				// var admin_fee = (request.dataValues.total_amount * 5)/100;
				// console.log(request.dataValues.total_amount);
				// console.log(admin_fee);
				// var payment={};
				// const payment = await helper.square_payment(req, res);
				// console.log(payment);

				// if(!empty(payment)){

				// console.log(payment);
				// return;

				await superagent
					.post('https://connect.squareup.com/v2/payments')
					.send({
						"idempotency_key": crypto.randomBytes(20).toString('hex'),
						"amount_money": {
							"amount": parseInt(_amount),
							"currency": "USD"
						},
						"source_id": requestdata.payment_nonce,
						"autocomplete": true,

					}) // sends a JSON post body
					.set('Square-Version', '2020-03-25')
					.set('Content-Type', 'application/json')
					.set('Authorization', 'Bearer ' + request.dataValues.square_account)
					.end((err, result_p) => {
						// console.log(err);
						send = {};
						if (!empty(err)) {
							console.log(err);

							var error_object = JSON.parse(err.response.text);
							// console.log(error_object);
							// console.log(error_object.errors[0].detail);
							// return;
							send.is_error = true;
							send.error_message = error_object.errors[0].detail;
							// console.log(error_object.errors[0].detail);
							// error_object.errors[0].detail;
							let msg = error_object.errors[0].detail;

							jsonData.wrong_status(res, msg);

						} else {
							send.is_error = false;
							send.result = result_p;
							console.log(result_p);
							const create_user = charity_payment.create({
								user_id: requestdata.user_id,
								charity_id: requestdata.charity_id,
								payment_response: JSON.stringify(result_p),
								amount: requestdata.amount

							});
							// console.log(request);
							// return;

							/*const push_data={};	
							push_data.sent_to_id=request.dataValues.barber.dataValues.id ;
							push_data.body=request.dataValues.user.dataValues.username +' done his appointment payment.';
							push_data.sent_data=request;
							push_data.notification_code= 1114 ;
							helper.Notification(push_data);*/

							// console.log(push_data);

							let msg = 'Payment done successfully';
							jsonData.true_status(res, sent, msg);
							// return send;
						}
						// console.log(send);
						// return send;


					});


				// }

			} else {
				throw "Invalid Charity id";
			}
			// console.log(all_requests);



		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	order_payment: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				request_id: req.body.request_id,
				payment_nonce: req.body.payment_nonce,
				type: req.body.type,// 1=online ,2=cash
				return_type: 1,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			var user_id = requestdata.user_id;
			const request = await orders.findOne({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating', 'device_type', 'device_token'],
					},
					{
						model: barber,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating', 'device_type', 'device_token', 'access_token', 'access_token_save_time', 'refresh_token'],
					}],
				where: {
					status: 1,
					id: requestdata.request_id,
				}
			});
			// var final_sent=[];
			sent = {}

			if (request) {
				request.dataValues.total_amount = request.dataValues.total_amount * 100;
				var admin_fee = (request.dataValues.total_amount * 5) / 100;
				// console.log(request.dataValues.total_amount);
				// console.log(admin_fee);
				// var payment={};
				// const payment = await helper.square_payment(req, res);
				// console.log(payment);

				// if(!empty(payment)){

				// console.log(payment);
				// return;
				if (requestdata.type == 1) {
					var current_timestamp = new Date().getTime() / 1000;
					var access_token = request.dataValues.barber.dataValues.access_token;
					if ((request.dataValues.barber.dataValues.access_token_save_time + 2332800) < current_timestamp) {
						await helper.refresh_squareup_auth_token(request.dataValues.barber.dataValues.id, request.dataValues.barber.dataValues.refresh_token);

						const get_tokan = await barber.findOne({

							where: {
								id: request.dataValues.barber.dataValues.id,
							}
						});
						// console.log(get_tokan.dataValues.access_token+'dsfsdfsdfsdf');
						// return;
						// if(d.is_error==false){
						access_token = get_tokan.dataValues.access_token
						// }else{
						// 	throw d.error_message;
						// }							
					}

					await superagent
						.post('https://connect.squareup.com/v2/payments')
						.send({
							"idempotency_key": crypto.randomBytes(20).toString('hex'),
							"amount_money": {
								"amount": parseInt(request.dataValues.total_amount),
								"currency": "USD"
							},
							"source_id": requestdata.payment_nonce,
							"autocomplete": true,
							"app_fee_money": {
								"amount": parseInt(admin_fee),
								"currency": "USD"
							}
						}) // sends a JSON post body
						.set('Square-Version', '2020-03-25')
						.set('Content-Type', 'application/json')
						.set('Authorization', 'Bearer ' + access_token)
						.end((err, result_p) => {
							console.log(err);
							send = {};
							if (!empty(err)) {
								// console.log(err);

								var error_object = JSON.parse(err.response.text);
								// console.log(error_object);
								// console.log(error_object.errors[0].detail);
								// return;
								send.is_error = true;
								send.error_message = error_object.errors[0].detail;
								// console.log(error_object.errors[0].detail);
								// error_object.errors[0].detail;
								let msg = error_object.errors[0].detail;

								jsonData.wrong_status(res, msg);

							} else {
								send.is_error = false;
								send.result = result_p;
								// console.log(result_p);
								const save_status = orders.update({
									status: 3,
								},
									{
										where: {
											id: requestdata.request_id,
										}
									}
								);
								// console.log(request);
								// return;

								const push_data = {};
								push_data.sent_to_id = request.dataValues.barber.dataValues.id;
								push_data.body = request.dataValues.user.dataValues.username + ' done his appointment payment.';
								push_data.sent_data = request;
								push_data.notification_code = 1114;



								helper.Notification(push_data);

								// console.log(push_data);

								let msg = 'Payment done successfully  ';
								jsonData.true_status(res, sent, msg);
								// return send;
							}
							// console.log(send);
							// return send;


						});
				} else {
					const save_status = orders.update({
						status: 3,
					},
						{
							where: {
								id: requestdata.request_id,
							}
						}
					);
					// console.log(request);
					// return;

					const push_data = {};
					push_data.sent_to_id = request.dataValues.barber.dataValues.id;
					push_data.body = request.dataValues.user.dataValues.username + ' will pay in cash his booking amount.';
					push_data.sent_data = request;
					push_data.notification_code = 1114;



					helper.Notification(push_data);

					// console.log(push_data);

					let msg = 'Payment done successfully  ';
					jsonData.true_status(res, sent, msg);
				}


				// }

			} else {
				throw "Invalid request id";
			}
			// console.log(all_requests);



		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	barber_request_status: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				status: req.body.status,
				request_id: req.body.request_id,
				return_type: 2,
			};
			const non_required = {

			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			var barber_id = requestdata.barber_id;

			// console.log(requestdata);
			// return;
			if (requestdata.status == 4) {
				check_status = 3;
			} else {
				check_status = 0;
			}
			const request = await orders.findOne({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating', 'device_type', 'device_token'],
					},
					{
						model: barber,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
				where: {
					status: check_status,
					barber_id: barber_id,
					id: requestdata.request_id,
				}
			});
			// var final_sent=[];
			sent = {}

			if (request) {
				var check_slot = {};
				if (requestdata.status == 1) {
					/*var check_slot= await orders.findOne({
						where :{
							barber_id:requestdata.barber_id,
							date:request.dataValues.date,
							slot_id:request.dataValues.slot_id,
							status:[3,4],
							[Op.not]: [
							{id :request.dataValues.id }
							]
						}
					});
					if(check_slot){
						requestdata.status=2;
							// throw "Current Time slot is booked by another user";
						}*/
					var check_slot = await orders.findAll({
						where: {
							barber_id: requestdata.barber_id,
							date: request.dataValues.date,
							/*slot_id:{
								[Op.like]: '%'+i+'%'
							},*/
							status: [1, 3, 4],
							[Op.not]: [
								{ id: request.dataValues.id }
							]
						}
					});

					if (check_slot.length > 0) {
						// console.log('Here i am');
						var booked_slot_id = JSON.parse("[" + request.dataValues.slot_id + "]");
						for (i = 0; i < check_slot.length; i++) {
							// console.log(check_slot[i]['slot_id']);
							if (check_slot[i]['slot_id']) {
								var slot_id_s_Array = JSON.parse("[" + check_slot[i]['slot_id'] + "]");
								array_slot_id = [];
								for (j of booked_slot_id) {
									console.log(j);
									if (slot_id_s_Array.indexOf(j) !== -1) {
										const get_lang = await user.findOne({
											attributes: ['language'],
											where: {
												auth_key: requestdata.auth_key,
											}
										});

										if (get_lang.dataValues.language == 1) {
											// var msg="";
											throw "Time slot is already booked, you can't accept it.";

										} else {
											throw "El horario ya está reservado, no puede aceptarlo.";
										}
									}
								}
							}
						}
					}
				}


				save_ababab = {};
				save_ababab.status = requestdata.status;
				if (requestdata.status == 1) {
					// save_ababab.is_rewarded=1;

				}

				const save_status = await orders.update(save_ababab,
					{
						where: {
							id: requestdata.request_id,
						}
					}
				);
				// console.log(request);
				// return;

				const push_data = {};
				push_data.sent_to_id = request.dataValues.user.dataValues.id;
				// push_data.device_token=request.dataValues.user.dataValues.device_token ;
				push_data.sent_data = request;
				if (requestdata.status == 1) {

					if (request.dataValues.is_rewarded == 2) {
						var update_to_order_rewarded = await orders.update({
							is_rewarded: 1,
						},
							{
								where: {
									status: [3, 4],
									barber_id: requestdata.barber_id,
									user_id: request.dataValues.user_id,
								}
							}
						);
					}

					/*all_completed_order = await orders.findAndCountAll({
							attributes: ['id'],						
							where:{
								is_rewarded:0,
								status:[3,4],
								barber_id: requestdata.barber_id,
								user_id: data.dataValues.id,
							}
						});*/
					push_data.notification_code = 1112;

					push_data.body = request.dataValues.barber.dataValues.username + ' accepted your appointment request';

				} else if (requestdata.status == 2) {
					push_data.notification_code = 1113;

					push_data.body = request.dataValues.barber.dataValues.username + ' rejected your appointment request';

				} else if (requestdata.status == 4) {
					push_data.notification_code = 1115;

					push_data.body = request.dataValues.barber.dataValues.username + ' marked your order as completed.';
				}
				// console.log(push_data);

				await helper.Notification(push_data);
				if (requestdata.status == 2 && check_slot) {
					// throw "Requested Time slot is booked by another user";
				}


				/*				var slot= await barbers_time_slot.findOne({
									attributes:['slot_id','slot','start_time','end_time'],
									where:{
										barber_id:barber_id,
										slot_id: request.dataValues.slot_id
									}
								});
		
								if(request.dataValues.services){
									var array_Service =  request.dataValues.services.split(',');
									all_Services=await services.findAll({
										attributes:['id','name','price'],
										where:{
											id:array_Service									
										}
									})
								}
								// sent=request;
								sent.request=request;
								sent.barber=request.dataValues.barber.dataValues;
								delete request.dataValues.barber.dataValues;
								sent.slot_Detail=slot;
								sent.services_detail=all_Services;*/

				// console.log(all_Services);
				// return;
				// final_sent.push(sent);
				let msg = 'Status saved successfully  ';
				jsonData.true_status(res, sent, msg);

			} else {
				throw "Invalid request id";
			}
			// console.log(all_requests);



		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	cancel_order: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				status: 5,
				request_id: req.body.request_id,
				return_type: 2,
			};
			const non_required = {

			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			var barber_id = requestdata.barber_id;

			// console.log(requestdata);
			// return;

			const request = await orders.findOne({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating', 'device_type', 'device_token'],
					},
					{
						model: barber,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
				where: {
					barber_id: barber_id,
					id: requestdata.request_id,
				}
			});
			// var final_sent=[];
			sent = {}

			if (request) {
				save_ababab = {};
				save_ababab.status = requestdata.status;
				const save_status = await orders.update(save_ababab,
					{
						where: {
							id: requestdata.request_id,
						}
					}
				);
				// console.log(request);
				// return;

				const push_data = {};
				push_data.sent_to_id = request.dataValues.user.dataValues.id;
				// push_data.device_token=request.dataValues.user.dataValues.device_token ;
				push_data.sent_data = request;
				if (requestdata.status == 5) {
					push_data.notification_code = 1117;

					push_data.body = request.dataValues.barber.dataValues.username + ' canceled your order.';
				}
				// console.log(push_data);

				await helper.Notification(push_data);

				let msg = 'Canceled successfully';
				jsonData.true_status(res, sent, msg);

			} else {
				throw "Invalid request id";
			}
			// console.log(all_requests);



		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	calender_orders: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				date: req.body.date,
				return_type: 2
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			var current_timestamp = new Date().getTime() / 1000;
			var barber_id = requestdata.barber_id;

			// console.log(barber_id);
			var all_requests = [];

			all_requests = await orders.findAll({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
				where: {
					status: [1, 3, 4],
					barber_id: barber_id,
					is_self: 0,
					date: requestdata.date,
				},
				order: [
					['id', 'DESC'],
				]
			});

			var final_sent = [];
			if (all_requests) {
				for (request of all_requests) {

					var slot_id_s_Array = JSON.parse("[" + request.dataValues.slot_id + "]");

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: barber_id,
							slot_id: slot_id_s_Array
						}
					});

					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}


					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
							}
						})
					}
					sent = {}
					// sent=request;
					sent.order = request;
					sent.user = request.dataValues.user.dataValues;
					delete request.dataValues.user.dataValues;
					sent.slot_Detail = slot;
					sent.services_detail = all_Services;
					final_sent.push(sent);
				}
			}
			// console.log(all_requests);

			let msg = 'All Orders ';
			jsonData.true_status(res, final_sent, msg);
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	barber_orders: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				is_upcoming: req.body.is_upcoming, // 1 upcoming ,2 past
				return_type: 2
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			var current_timestamp = new Date().getTime() / 1000;
			var barber_id = requestdata.barber_id;

			// console.log(barber_id);
			var all_requests = [];
			if (requestdata.is_upcoming == 1) {
				all_requests = await orders.findAll({
					// attributes :['id','user_id','status','barber_id','date'],
					include: [
						{
							model: user,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						}],
					where: {
						status: [3, 5],
						is_self: 0,
						barber_id: barber_id,
						date: { [Op.gte]: current_timestamp },

					},
					order: [
						['id', 'DESC'],
					]
				});
			} else {
				all_requests = await orders.findAll({
					// attributes :['id','user_id','status','barber_id','date'],
					include: [
						{
							model: user,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						}],
					where: {
						is_self: 0,

						status: [4, 5],
						barber_id: barber_id,
						// date :{[Op.lte]: current_timestamp},
					},
					order: [
						['id', 'DESC'],
					]
				});
			}
			var final_sent = [];
			if (all_requests) {
				for (request of all_requests) {
					var slot_id_s_Array = JSON.parse("[" + request.dataValues.slot_id + "]");

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: barber_id,
							slot_id: slot_id_s_Array
						}
					});

					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}
					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
							}
						})
					}
					sent = {}
					// sent=request;
					if (request.dataValues.user) {
						sent.order = request;
						sent.user = request.dataValues.user.dataValues;
						delete request.dataValues.user.dataValues;
						sent.slot_Detail = slot;
						sent.services_detail = all_Services;
						final_sent.push(sent);
					}

				}
			}
			// console.log(all_requests);

			let msg = 'All Orders ';
			jsonData.true_status(res, final_sent, msg);
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	user_orders: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				is_upcoming: req.body.is_upcoming, // 1 upcoming ,2 past
				return_type: 1
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			var current_timestamp = new Date().getTime() / 1000;
			var user_id = requestdata.user_id;

			// console.log(barber_id);
			var all_requests = [];
			if (requestdata.is_upcoming == 1) {
				all_requests = await orders.findAll({
					// attributes :['id','user_id','status','barber_id','date'],
					include: [
						{
							model: barber,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						}],
					where: {
						is_self: 0,
						status: [3, 5],
						user_id: user_id,
						date: { [Op.gte]: current_timestamp },

					},
					order: [
						['id', 'DESC'],
					]
				});
			} else {
				all_requests = await orders.findAll({
					// attributes :['id','user_id','status','barber_id','date'],
					include: [
						{
							model: barber,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						}],
					where: {
						is_self: 0,
						status: [4, 5],
						user_id: user_id,
						// date :{[Op.lte]: current_timestamp},
					},
					order: [
						['id', 'DESC'],
					]
				});
			}
			var final_sent = [];
			if (all_requests) {
				for (request of all_requests) {
					/*var slot= await barbers_time_slot.findOne({
						attributes:['slot_id','slot','start_time','end_time'],
						where:{
							barber_id:request.dataValues.barber_id,
							slot_id: request.dataValues.slot_id
						}
					});*/

					var slot_id_s_Array = JSON.parse("[" + request.dataValues.slot_id + "]");

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: request.dataValues.barber_id,
							slot_id: slot_id_s_Array
						}
					});

					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}

					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
							}
						})
					}
					sent = {}
					// sent=request;
					if (request.dataValues.barber) {

						sent.order = request;
						sent.barber = request.dataValues.barber.dataValues;
						delete request.dataValues.barber.dataValues;
						sent.slot_Detail = slot;
						sent.services_detail = all_Services;
						final_sent.push(sent);
					}
				}
			}
			// console.log(all_requests);

			let msg = 'All Orders ';
			jsonData.true_status(res, final_sent, msg);
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	check_slot_availability: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				barber_id: req.body.barber_id,
				date: req.body.date,
				slot_id: req.body.slot_id,
				return_type: 1
			};
			const non_required = {
				info: req.body.info,
			};
			let requestdata = await helper.vaildObject(required, non_required, res);

			user_id = requestdata.user_id;

			var check_slot = await orders.findOne({
				where: {
					barber_id: requestdata.barber_id,
					date: requestdata.date,
					slot_id: requestdata.slot_id,
					status: [3, 4]
				}
			});
			if (check_slot) {
				body = 0;
				// throw "Current Time slot is booked by another user";
			} else {
				body = 1;

			}
			let msg = 'Availability Status';
			jsonData.true_status(res, body, msg);

		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	order_detail: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				order_id: req.body.order_id,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				user_id = userdata.dataValues.id;

				var request = await orders.findOne({
					// attributes :['id','user_id','status','barber_id','date'],
					include: [
						{
							model: user,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						},
						{
							model: barber,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						}],
					where: {
						id: requestdata.order_id,
					}
				});
				var full_final_sent = {};
				order_detail = {}

				if (request) {
					var array_slot_id = request.dataValues.slot_id.split(',');

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: request.dataValues.barber_id,
							slot_id: array_slot_id
						}
					});
					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}
					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
							}
						})
					}
					// sent=request;
					order_detail.order = request;
					// sent.barber=request.dataValues.barber.dataValues;
					// delete request.dataValues.barber.dataValues;
					order_detail.slot_Detail = slot;
					order_detail.services_detail = all_Services;

					//check swap request sent or not

					order_detail.swap_request_sent = 0;
					order_detail.order.swap_request_user_id = 0;

					order_detail.is_rated = 0;
					order_detail.strike_given = 0;

					if (userdata.dataValues.user_type == 1) {

						var check_swap_request = await swap_requests.findOne({
							where: {
								user_id: user_id,
								from_order_id: requestdata.order_id,
								status: 0
							}
						});
						if (check_swap_request) {
							order_detail.order.swap_request_to_order_id = check_swap_request.dataValues.to_order_id;

							order_detail.swap_request_sent = 1;
						}


						// Review type: 1=User to barber,2= barber to user,3=Strike
						var check_rating = await reviews.findOne({
							attributes: ['id'],
							where: {
								from_id: user_id,
								type: 1,
								order_id: requestdata.order_id,
							}
						});
						if (check_rating) {
							order_detail.is_rated = 1;
						}
					} else {
						var check_rating = await reviews.findOne({
							attributes: ['id'],
							where: {
								from_id: user_id,
								type: 2,
								order_id: requestdata.order_id,
							}
						});
						if (check_rating) {
							order_detail.is_rated = 1;
						}

						// Check strike

						var check_strike = await reviews.findOne({
							attributes: ['id'],
							where: {
								from_id: user_id,
								type: 3,
								order_id: requestdata.order_id,
							}
						});
						if (check_strike) {
							order_detail.strike_given = 1;
						}
					}
					var current_timestamp = new Date().getTime() / 1000;

					const all_requests = await orders.findAll({
						// attributes :['id','user_id','status','barber_id','date'],
						include: [
							{
								model: user,
								attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
							}],
						where: {
							[Op.not]: [
								// {id :requestdata.order_id },
								{ user_id: user_id }
							],
							date: { [Op.gte]: current_timestamp },

							// date:request.dataValues.date,
							status: [3],
							slot_count: request.dataValues.slot_count,
							barber_id: request.dataValues.barber_id
						},
						order: [
							['id', 'DESC'],
						]
					});
					var final_sent = [];

					if (all_requests) {
						for (request of all_requests) {
							var array_slot_id_ = request.dataValues.slot_id.split(',');

							var slots = await barbers_time_slot.findAll({
								attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
								where: {
									barber_id: request.dataValues.barber_id,
									slot_id: array_slot_id_
								}
							});

							slot = {};
							if (slots.length > 0) {
								// console.log(slots);
								slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
								// console.log(slots[slots.length-1].dataValues.end_time);
								slot = slots[0];
							}
							request.dataValues.user.dataValues.swap_request_sent = 0;
							if (request.dataValues.id == order_detail.order.swap_request_to_order_id) {
								request.dataValues.user.dataValues.swap_request_sent = 1;
							}

							sent = {}
							// sent=request;
							sent.order = request;
							// sent.user=request.dataValues.user.dataValues;
							// delete request.dataValues.user.dataValues;
							sent.slot_Detail = slot;
							// console.log(all_Services);
							// return;
							final_sent.push(sent);
						}
					}
					full_final_sent.order_detail = order_detail;
					full_final_sent.booked_slots = final_sent;

					// console.log(all_Services);
					// return;
					// final_sent.push(sent);
					let msg = 'Order Detail ';
					jsonData.true_status(res, full_final_sent, msg);

				} else {
					throw "Invalid order id";
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
			// console.log(all_requests);



		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	swap_requests: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				from_order_id: req.body.from_order_id,
				to_order_id: req.body.to_order_id,
				to_user_id: req.body.to_user_id,
			};
			const non_required = {
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				user_id = userdata.dataValues.id;
				var check_swap_request = await swap_requests.findOne({
					where: {
						user_id: user_id,
						from_order_id: requestdata.from_order_id,
						to_order_id: requestdata.to_order_id,
						to_user_id: requestdata.to_user_id,
						status: 0,
					}
				});
				if (check_swap_request) {
					const get_lang = await user.findOne({
						attributes: ['language'],
						where: {
							auth_key: requestdata.auth_key,
						}
					});

					if (get_lang.dataValues.language == 1) {
						throw "You have already sent swap request to this user.";

					} else {
						throw "Ya enviaste una solicitud de intercambio a este usuario";

					}
				}
				save_data = {};
				save_data = requestdata;
				save_data.user_id = user_id;
				const save = await swap_requests.create(save_data);
				if (save) {
					var order_id = save.dataValues.id;
					const push_data = {};
					push_data.sent_to_id = requestdata.to_user_id;
					push_data.notification_code = 1116;
					push_data.sent_data = save;
					push_data.body = 'Someone sent you a swap request';
					await helper.Notification(push_data);
					let msg = 'Swap Request sent to user';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	user_swap_request: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				request_type: req.body.request_type, // 1 =recieved request ,2= sent_request
				return_type: 1
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			// console.log(barber_id);
			if (requestdata.request_type == 1) {
				all_requests = await swap_requests.findAll({

					where: {
						to_user_id: requestdata.user_id,
						status: 0,
					},
					order: [
						['id', 'DESC'],
					]
				});
			} else {
				all_requests = await swap_requests.findAll({

					where: {
						user_id: requestdata.user_id,
						status: 0,
					},
					order: [
						['id', 'DESC'],
					]
				});
			}

			// console.log(all_requests);
			// return;
			var final_sent = [];
			if (all_requests) {
				for (request of all_requests) {
					// console.log(request);
					// return;
					from_order_detail = await orders.findOne({
						// attributes :['id','user_id','status','barber_id','date','slot_id'],
						include: [
							{
								model: user,
								attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
							},
							{
								model: barber,
								attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
							}],
						where: {
							id: request.dataValues.from_order_id,
						}
					});

					/*var from_slot= await barbers_time_slot.findOne({
						attributes:['slot_id','slot','start_time','end_time'],
						where:{
							barber_id: from_order_detail.dataValues.barber_id,
							slot_id: from_order_detail.dataValues.slot_id
						}
					});*/

					var slot_id_s_Array = JSON.parse("[" + from_order_detail.dataValues.slot_id + "]");

					var from_slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: from_order_detail.dataValues.barber_id,
							slot_id: slot_id_s_Array
						}
					});

					from_slot = {};
					if (from_slots.length > 0) {
						// console.log(from_slots);
						from_slots[0].dataValues.end_time = from_slots[from_slots.length - 1].dataValues.end_time;
						// console.log(from_slots[from_slots.length-1].dataValues.end_time);
						from_slot = from_slots[0];
					}


					if (from_order_detail.dataValues.services) {
						var array_Service = from_order_detail.dataValues.services.split(',');
						from_Services = await services.findAll({
							attributes: ['id', 'name', 'price'],
							where: {
								id: array_Service
							}
						})
					}

					to_order_detail = await orders.findOne({
						// attributes :['id','user_id','status','barber_id','date','slot_id'],
						include: [
							{
								model: user,
								attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
							},
							{
								model: barber,
								attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
							}
						],
						where: {
							id: request.dataValues.to_order_id,
						}
					});

					/*var to_slot= await barbers_time_slot.findOne({
						attributes:['slot_id','slot','start_time','end_time'],
						where:{
							barber_id: to_order_detail.dataValues.barber_id,
							slot_id: to_order_detail.dataValues.slot_id
						}
					});*/

					var slot_id_s_Array_to = JSON.parse("[" + to_order_detail.dataValues.slot_id + "]");

					var to_slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: to_order_detail.dataValues.barber_id,
							slot_id: slot_id_s_Array_to
						}
					});

					to_slot = {};
					if (to_slots.length > 0) {
						// console.log(to_slots);
						to_slots[0].dataValues.end_time = to_slots[to_slots.length - 1].dataValues.end_time;
						// console.log(to_slots[to_slots.length-1].dataValues.end_time);
						to_slot = to_slots[0];
					}
					if (to_order_detail.dataValues.services) {
						var array_Service = to_order_detail.dataValues.services.split(',');
						to_Services = await services.findAll({
							attributes: ['id', 'name', 'price'],
							where: {
								id: array_Service
							}
						})
					}



					sent = {};
					sent.request_detail = request;
					sent.from_request = from_order_detail;
					sent.from_request.dataValues.slot_Detail = from_slot;
					sent.from_request.dataValues.services = from_Services;
					sent.to_request = to_order_detail;
					sent.to_request.dataValues.slot_Detail = to_slot;
					sent.to_request.dataValues.services = to_Services;
					// console.log(all_Services);
					// return;
					final_sent.push(sent);


				}
			}
			// console.log(all_requests);

			let msg = 'All requests ';
			jsonData.true_status(res, final_sent, msg);
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	//09-07-2020 New APIS
	swap_request_status: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				request_id: req.body.request_id,
				status: req.body.status,// 1 =Accept ,2= reject
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			// console.log(barber_id);
			request = await swap_requests.findOne({
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating', 'device_type', 'device_token'],
					}
				],
				where: {
					id: requestdata.request_id,
					status: 0,
				}
			});


			// console.log(all_requests);
			// return;
			var final_sent = [];
			if (request) {
				const push_data = {};
				push_data.sent_to_id = request.dataValues.user_id;
				push_data.sent_data = request;
				const save_status = await swap_requests.update({
					status: requestdata.status,
				},
					{
						where: {
							id: requestdata.request_id,
						}
					}
				);
				if (requestdata.status == 1) {
					push_data.notification_code = 1122;
					push_data.body = request.dataValues.user.dataValues.username + ' accepted your swap request';

					from_order_detail = await orders.findOne({
						attributes: ['id', 'user_id', 'status', 'barber_id', 'date', 'slot_id'],
						where: {
							id: request.dataValues.from_order_id,
						}
					});

					to_order_detail = await orders.findOne({
						attributes: ['id', 'user_id', 'status', 'barber_id', 'date', 'slot_id'],
						where: {
							id: request.dataValues.to_order_id,
						}
					});

					// update to order slot id and date in from order i.e swap work
					const _to_slot_id = to_order_detail.dataValues.slot_id;

					var update_to_order_slot = await orders.update({
						slot_id: from_order_detail.dataValues.slot_id,
						date: from_order_detail.dataValues.date,
					},
						{
							where: {
								id: to_order_detail.dataValues.id,
							}
						}
					);
					var update_from_order_slot = await orders.update({
						slot_id: _to_slot_id,
						date: to_order_detail.dataValues.date
					},
						{
							where: {
								id: from_order_detail.dataValues.id,
							}
						}
					);

				} else if (requestdata.status == 2) {
					push_data.notification_code = 1123;

					push_data.body = request.dataValues.user.dataValues.username + ' rejected your swap request';
				}
				// console.log(push_data);

				await helper.Notification(push_data);
				let msg = 'Status saved successfully';
				jsonData.true_status(res, final_sent, msg);

			} else {
				throw "Invalid request_id";
			}
			// console.log(all_requests);


		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	send_push_user: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				description: req.body.description,
				lat: req.body.lat,
				lng: req.body.lng,
				type: req.body.type //1=all ,2= fav users only
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				let user_id = userdata.dataValues.id;

				lat = requestdata.lat;
				lng = requestdata.lng;
				if (requestdata.type == 1) {
					const users = await user.findAll({
						attributes: [`id`, `username`, `avg_rating`, `profile_image`, `phone`, `email`, `user_type`, `otp_verified`, `lat`, `lng`, `address`, `description`,
							[sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(lat)) * cos(radians(" + lng + ") - radians(lng)) + sin(radians(" + lat + ")) * sin(radians(lat)))"), 'distance']],
						where: {
							status: 1,
							user_type: 1,

						},
						// having:{'distance <=':1000},
						order: sequelize.col('distance'),

					});
					const final_barber_list = [];
					if (users) {
						for (let user_d of users) {
							var push_data = {};
							push_data.sent_to_id = user_d.dataValues.id;
							push_data.notification_code = 10000;
							push_data.sent_data = requestdata.description;
							push_data.body = requestdata.description;
							await helper.Notification(push_data);
						}
					}
				} else {
					const users = await likes.findAll({

						attributes: ['id', 'barber_id', 'user_id', 'createdAt'],
						where: {
							barber_id: userdata.dataValues.id,
							status: 1
						}
					});
					const final_barber_list = [];
					if (users) {
						for (let user_d of users) {
							var push_data = {};
							push_data.sent_to_id = user_d.dataValues.user_id;
							push_data.notification_code = 10000;
							push_data.sent_data = requestdata.description;
							push_data.body = requestdata.description;
							await helper.Notification(push_data);
						}
					}
				}


				// console.log(all_barbers);

				let msg = 'Sent';
				let finaldata = {};
				// console.log(finaldata);
				jsonData.true_status(res, finaldata, msg)
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			console.log(error);
			jsonData.wrong_status(res, error)
		}
	},
	rating_and_strike: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				// to_id: req.body.to_id,
				type: req.body.type,// 1=User to barber,2= barber to user,3=Strike
				order_id: req.body.order_id,
			};
			const non_required = {
				rating: req.body.rating,
				review: req.body.review,
			};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				user_id = userdata.dataValues.id;
				user_type = userdata.dataValues.user_type;
				var order_detail = await orders.findOne({
					where: {
						id: requestdata.order_id,
					}
				});
				// console.log(order_detail);
				if (order_detail) {
					if (user_type == 1) {
						requestdata.to_id = order_detail.dataValues.barber_id;
					} else {
						requestdata.to_id = order_detail.dataValues.user_id;
					}
					if (requestdata.type != 3) {
						if (user_type == 1) {
							requestdata.type = 1;
						} else {
							requestdata.type = 2;
						}
					}
				}


				var check_rating = await reviews.findOne({
					attributes: ['id'],
					where: {
						from_id: user_id,
						to_id: requestdata.to_id,
						type: requestdata.type,
						order_id: requestdata.order_id,
					}
				});
				if (check_rating) {
					throw "Already rated";
				}

				save_data = {};
				save_data = requestdata;
				save_data.from_id = user_id;


				const save = await reviews.create(save_data);
				if (save) {
					var order_id = save.dataValues.id;
					var save_user_average = {};

					if (requestdata.type == 3) {
						var average_rating = await reviews.findAll({
							attributes: ['id', 'to_id', 'rating',
								[sequelize.fn('count', 'id'), 'count'],
							],
							where: {
								to_id: requestdata.to_id,
								type: 3,
							}
						});

						save_user_average.strike_count = average_rating[0].dataValues.count;

					} else {
						var average_rating = await reviews.findAll({
							attributes: ['id', 'to_id', 'rating',
								[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
								[sequelize.fn('count', 'id'), 'count'],
							],
							where: {
								to_id: requestdata.to_id,
								type: requestdata.type,
							}
						});
						// console.log(average_rating);
						// console.log(average_rating[0].dataValues.avg_rating);
						// return;
						save_user_average.avg_rating = average_rating[0].dataValues.avg_rating;
						save_user_average.review_count = average_rating[0].dataValues.count;
					}

					var _save_user_average = await user.update(save_user_average,
						{
							where: {
								id: requestdata.to_id,
							}
						}
					);



					const push_data = {};
					push_data.sent_to_id = requestdata.to_id;
					push_data.notification_code = 8520;
					push_data.sent_data = save;
					if (requestdata.type == 3) {
						push_data.body = userdata.dataValues.username + ' give you a strike.';
					} else {
						push_data.body = userdata.dataValues.username + ' rated you ' + requestdata.rating + ' on recent order.';
					}
					await helper.Notification(push_data);


					let msg = 'Done';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	get_rating_and_strike: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				to_id: req.body.to_id,
				// type: req.body.type,				
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const userdata = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (userdata) {
				user_id = userdata.dataValues.id;

				//Given, 1=User to barber,2= barber to user,3=Strike
				const to_data = await user.findOne({
					where: {
						id: requestdata.to_id,
					}
				});
				if (to_data) {
					if (to_data.dataValues.user_type == 1) {
						requestdata.type = 2;
					} else {
						requestdata.type = 1;
					}

					var average_rating = await reviews.findOne({
						attributes: ['id',
							[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
							[sequelize.fn('count', 'id'), 'count'],
						],
						where: {
							to_id: requestdata.to_id,
							type: requestdata.type,
						}
					});
					var all_reviews = await reviews.findAll({
						// attributes:['id'],
						include: [{
							model: user,
							attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
						}],
						where: {
							to_id: requestdata.to_id,
							type: requestdata.type,
						}
					});
					let finaldata = {};
					finaldata.average_rating = average_rating;
					finaldata.all_reviews = all_reviews;

					let msg = 'All ';
					jsonData.true_status(res, finaldata, msg);
				} else {

					let msg = 'Invalid to_id';
					jsonData.invalid_status(res, msg)
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	update_lat_long: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				lat: req.body.lat,
				lng: req.body.lng,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				const detail_data = await user.update({
					lat: requestdata.lat,
					lng: requestdata.lng
				},
					{
						where:
						{
							id: user_data.dataValues.id
						}
					});
				let msg = 'Updated Successfully';
				let data = {};
				jsonData.true_status(res, data, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	reward_setting: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				reward_percentage: req.body.reward_percentage,
				reward_order_count: req.body.reward_order_count,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				const detail_data = await user.update({
					reward_order_count: requestdata.reward_order_count,
					reward_percentage: requestdata.reward_percentage
				},
					{
						where:
						{
							id: user_data.dataValues.id
						}
					});
				let msg = 'Barber Reward';
				let data = {};
				data.reward_order_count = requestdata.reward_order_count;
				data.reward_percentage = requestdata.reward_percentage;
				jsonData.true_status(res, data, msg)
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
	add_category: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				name: req.body.name,
				name_spanish: req.body.name_spanish,
				image: req.files.image,

			};
			const non_required = {

				description: req.body.description,
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				let barber_id = data.dataValues.id;

				save_data = {};
				save_data = requestdata;
				save_data.barber_id = barber_id
				if (req.files && req.files.image) {
					image = await helper.image_upload(req.files.image, 'services');
					save_data.image = req.protocol + '://' + req.get('host') + '/images/services/' + image;

				}
				// console.log(save_data);
				const save = await category.create(save_data);
				if (save) {
					let msg = 'Category sucessfully saved';
					jsonData.true_status(res, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}
			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	//09-03-2021

	offers: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				zipcode: req.body.zipcode,

			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				var current_timestamp = new Date().getTime() / 1000;

				// console.log(save_data);
				const all_Services = await offers.findAll({
					where: {
						status: 1,
						// timestamp :{[Op.gte]: current_timestamp},
					},
					order: [
						['id', 'DESC'],
					]
				});
				if (all_Services) {
					let msg = 'Offers List ';
					jsonData.true_status(res, all_Services, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	ads: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				zipcode: req.body.zipcode,

			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);

			const data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key,
				}
			});

			if (data) {
				var current_timestamp = new Date().getTime() / 1000;

				// console.log(save_data);
				const all_Services = await ads.findAll({
					where: {
						status: 1,
						// timestamp :{[Op.gte]: current_timestamp},
					},
					order: [
						['id', 'DESC'],
					]
				});
				if (all_Services) {
					let msg = 'Ads List ';
					jsonData.true_status(res, all_Services, msg);
				} else {
					let msg = 'Try Again Somthing Wrong';
					jsonData.true_status(res, msg);
				}


			} else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	track_sale: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				// is_upcoming: req.body.is_upcoming, // 1 upcoming ,2 past
				type: req.body.type, // 1 upcoming ,2 past
				return_type: 2
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);
			var current_timestamp = new Date().getTime() / 1000;
			var barber_id = requestdata.barber_id;

			// console.log(barber_id);
			var all_requests = [];
			if (requestdata.type == 1) {
				var start_time = (parseInt(moment().startOf('day') / 1000));
				var end_time = (parseInt(moment().endOf('day') / 1000));

			} else if (requestdata.type == 2) {
				var start_time = (parseInt(moment().startOf('week') / 1000)) + parseInt(86400);
				var end_time = (parseInt(moment().endOf('week') / 1000)) + parseInt(86400);
				/*console.log('now ' + moment().toString())
				console.log('start ' + moment().startOf('week')/1000)
				console.log( 'end ' + moment().endOf('week')/1000)*/
			} else if (requestdata.type == 3) {
				var start_time = (parseInt(moment().startOf('month') / 1000));
				var end_time = (parseInt(moment().endOf('month') / 1000));
			} else if (requestdata.type == 4) {
				var start_time = (parseInt(moment().startOf('year') / 1000));
				var end_time = (parseInt(moment().endOf('year') / 1000));
			}
			// start_time=1579700630;
			// end_time=1616423553;
			complete_orders = await orders.findAndCountAll({
				attributes: ['id', [sequelize.fn('sum', sequelize.col('total_amount')), 'sale'],],
				where: {
					status: [4],
					is_self: 0,
					barber_id: barber_id,
					date: {
						[Op.between]: [start_time, end_time]
					},

				}
			});
			incomplete_orders = await orders.findAndCountAll({
				attributes: ['id'],
				where: {
					status: [3],
					is_self: 0,
					barber_id: barber_id,
					date: {
						[Op.between]: [start_time, end_time]
					},

				}
			});

			console.log(start_time);
			console.log(end_time);
			all_requests = await orders.findAll({
				// attributes :['id','user_id','status','barber_id','date'],
				include: [
					{
						model: user,
						attributes: [`id`, `username`, `profile_image`, 'avg_rating'],
					}],
				where: {
					is_self: 0,
					status: [3, 4],
					barber_id: barber_id,
					date: {
						[Op.between]: [start_time, end_time]
						// [Op.between]: [1607860387,1616420651]
					},
				},
				order: [
					['id', 'DESC'],
				]
			});

			var final_sent = [];
			if (all_requests) {
				for (request of all_requests) {
					var slot_id_s_Array = JSON.parse("[" + request.dataValues.slot_id + "]");

					var slots = await barbers_time_slot.findAll({
						attributes: ['slot_id', 'slot', 'start_time', 'end_time'],
						where: {
							barber_id: barber_id,
							slot_id: slot_id_s_Array
						}
					});

					slot = {};
					if (slots.length > 0) {
						// console.log(slots);
						slots[0].dataValues.end_time = slots[slots.length - 1].dataValues.end_time;
						// console.log(slots[slots.length-1].dataValues.end_time);
						slot = slots[0];
					}
					if (request.dataValues.services) {
						var array_Service = request.dataValues.services.split(',');
						const get_lang = await user.findOne({
							attributes: ['language'],
							where: {
								auth_key: requestdata.auth_key,
							}
						});

						if (get_lang.dataValues.language == 1) {
							att = [`id`, `name`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`]
						} else {
							att = [`id`, `description`, `category_id`, `barber_id`, `duration`, `price`, `image`, `status`, `createdAt`,
								[sequelize.literal('name_spanish'), 'name'],
							]
						}
						all_Services = await services.findAll({
							attributes: att,
							where: {
								id: array_Service
							}
						})
					}
					sent = {}
					// sent=request;
					if (request.dataValues.user) {
						sent.order = request;
						sent.user = request.dataValues.user.dataValues;
						delete request.dataValues.user.dataValues;
						sent.slot_Detail = slot;
						sent.services_detail = all_Services;
						final_sent.push(sent);
					}

				}
			}
			full_final = {};
			var incomplete_orders_count = 0;
			if (!empty(incomplete_orders)) {
				incomplete_orders_count = incomplete_orders.count;
			}

			var complete_orders_count = 0;
			sale_amount = 0;
			// console.log(complete_orders.rows[0].dataValues.sale);
			if (!empty(complete_orders)) {

				complete_orders_count = complete_orders.count;
				if (!empty(complete_orders.rows)) {
					sale_amount = complete_orders.rows[0].dataValues.sale;

				}
			}
			full_final.upcoming = incomplete_orders_count;
			full_final.complete_orders = complete_orders_count;
			full_final.sale_amount = sale_amount;
			full_final.orders = final_sent;

			// console.log(all_requests);

			let msg = 'All Orders ';
			jsonData.true_status(res, full_final, msg);
		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	barber_subscription: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				email_address: req.body.email_address,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				phone_number: req.body.phone_number,
				card_nonce: req.body.card_nonce,
				return_type: 2,
			};
			const non_required = {
			};

			let requestdata = await helper.vaildObject(required, non_required, res);


			var barber_id = requestdata.barber_id;

			const subscription_amount = 20;
			const subscriptions_plan_id = "A6A2KUVIP7HKKVCSFCAD56JT";

			var _amount = subscription_amount * 100;

			const barber_data = await user.findOne({
				attributes: [`id`, `username`, `avg_rating`, `auth_key`, `otp`, `profile_image`, `phone`, `email`, `user_type`, `otp_verified`, `lat`, `lng`, `address`, `description`,
				],
				where: {
					auth_key: requestdata.auth_key,
				}
			});
			if (barber_data) {
				await superagent
					.post('https://connect.squareup.com/v2/customers')
					.send({
						"idempotency_key": crypto.randomBytes(20).toString('hex'),
						"family_name": barber_data.dataValues.username,
						// "last_name":requestdata.last_name,
						// "family_name":requestdata.first_name,
						"email_address": barber_data.dataValues.email,
						"phone_number": barber_data.dataValues.phone,

					}) // sends a JSON post body
					.set('Square-Version', '2021-03-17')
					.set('Content-Type', 'application/json')
					.set('Authorization', 'Bearer EAAAEKx1T18tzQeWjmuSYa5oftdJAyx4L8tqhhGRpgXYBFHDf1UaLYNT3vdNLYr7')
					.end((err, result_p) => {
						// console.log(err);
						send = {};
						if (!empty(err)) {

							jsonData.wrong_status(res, err);

						} else {
							if (result_p.status == 200) {
								var customer_data = JSON.parse(result_p.text);
								console.log(customer_data.customer.id);

								superagent
									.post('https://connect.squareup.com/v2/customers/' + customer_data.customer.id + '/cards')
									.send({
										// "idempotency_key": crypto.randomBytes(20).toString('hex'),
										// "family_name":barber_data.dataValues.username,
										"card_nonce": requestdata.card_nonce,
										// "family_name":requestdata.first_name,
										// "email_address": barber_data.dataValues.email,
										// "phone_number": barber_data.dataValues.phone,

									}) // sends a JSON post body
									.set('Square-Version', '2021-03-17')
									.set('Content-Type', 'application/json')
									.set('Authorization', 'Bearer EAAAEKx1T18tzQeWjmuSYa5oftdJAyx4L8tqhhGRpgXYBFHDf1UaLYNT3vdNLYr7')
									.end((error, result) => {
										console.log(error);
										send = {};
										if (!empty(error)) {

											jsonData.wrong_status(res, error);

										} else {
											// console.log(result);

											if (result.status == 200) {
												var card_data = JSON.parse(result.text);
												console.log(card_data.card.id);

												superagent
													.post('https://connect.squareup.com/v2/subscriptions')
													.send({
														"idempotency_key": crypto.randomBytes(20).toString('hex'),
														"location_id": "LH1AJT28EE1K8",
														"plan_id": subscriptions_plan_id,
														"customer_id": customer_data.customer.id,
														"card_id": card_data.card.id,

													}) // sends a JSON post body
													.set('Square-Version', '2021-03-17')
													.set('Content-Type', 'application/json')
													.set('Authorization', 'Bearer EAAAEKx1T18tzQeWjmuSYa5oftdJAyx4L8tqhhGRpgXYBFHDf1UaLYNT3vdNLYr7')
													.end((error_1, result_1) => {
														// console.log(err);
														send = {};
														if (!empty(error_1)) {

															jsonData.wrong_status(res, error_1);

														} else {
															// console.log(result_1);
															if (result_1.status == 200) {
																var subscriptions = JSON.parse(result_1.text);
																// console.log(subscriptions.card.id);
																const save_data = user.update({
																	subscription_status: 1,
																	customer_id: customer_data.customer.id,
																	plan_id: subscriptions_plan_id,
																	card_id: requestdata.card_nonce,
																	subscription_id: subscriptions.subscription.id,
																	subscription_json: result_1.text
																},
																	{
																		where: {
																			id: barber_id,
																		}
																	}
																);
															} else {
																throw "Something Wrong";
															}


															let msg = 'Subscribed successfully';
															jsonData.true_status(res, subscriptions, msg);
														}

													});

											} else {
												throw "Invalid card nonce";
											}


											// let msg = 'Payment done successfully';
											// jsonData.true_status(res,result, msg);               
										}

									});

							} else {
								throw "customer not created"
							}


							// let msg = 'Payment done successfully';
							// jsonData.true_status(res,result_p, msg);               
						}

					});

			} else {
				throw "Invalid authorization";
			}


			// console.log(all_requests);



		} catch (errr) {
			console.log(errr, "--------------------errr-----------");
			jsonData.wrong_status(res, errr)
		}
	},
	cancel_subscription: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				where: {
					auth_key: requestdata.auth_key
				}
			});
			if (user_data) {
				await superagent
					.post('https://connect.squareup.com/v2/subscriptions/' + user_data.dataValues.subscription_id + '/cancel')
					.send() // sends a JSON post body
					.set('Square-Version', '2021-03-17')
					.set('Content-Type', 'application/json')
					.set('Authorization', 'Bearer EAAAEKx1T18tzQeWjmuSYa5oftdJAyx4L8tqhhGRpgXYBFHDf1UaLYNT3vdNLYr7')
					.end((err, result_p) => {
						if (result_p) {
							var subscriptions = JSON.parse(result_p.text);

							const save_data = user.update({
								subscription_status: 0,
								/*customer_id: customer_data.customer.id,
								plan_id: subscriptions_plan_id,
								card_id: requestdata.card_nonce,*/
								subscription_id: '',
								subscription_json: subscriptions
							},
								{
									where: {
										id: user_data.dataValues.id,
									}
								});
							let msg = 'Subscriptions canceled successfully';
							let data = {};
							jsonData.true_status(res, subscriptions, msg)
						} else {
							let msg = 'Something Wrong';
							let data = {};
							jsonData.true_status(res, err, msg)
						}
					});
			}
			else {
				let msg = 'Invalid authorization key';
				jsonData.invalid_status(res, msg)
			}
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},

	language: async function (req, res) {
		try {
			const required = {
				security_key: req.headers.security_key,
				auth_key: req.headers.auth_key,
				type: req.body.type,
			};
			const non_required = {};
			let requestdata = await helper.vaildObject(required, non_required, res);
			const user_data = await user.findOne({
				attributes: ['id', 'language'],
				where: {
					auth_key: requestdata.auth_key
				}
			});
			var data = user_data.dataValues.language;
			if (!empty(user_data) && requestdata.type != 0) {
				var detail_data = await user.update({
					language: requestdata.type,
				},
					{
						where:
						{
							id: user_data.dataValues.id
						}
					});
				data = requestdata.type;
			}
			let msg = 'language';
			jsonData.true_status(res, data, msg)
		}
		catch (error) {
			jsonData.wrong_status(res, error)
		}
	},
}