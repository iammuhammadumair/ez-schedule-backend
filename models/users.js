/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('users', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		username: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'username'
		},
		language: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'language'
		},

		profile_image: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'profile_image'
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
			defaultValue: '',
			field: 'phone'
		},
		email: {
			type: DataTypes.STRING(200),
			allowNull: true,
			defaultValue: '',
			field: 'email'
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'password'
		},
		schedule: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'schedule'
		},
		user_type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'user_type'
		},
		otp: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'otp'
		},
		otp_verified: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'otp_verified'
		},
		forgotPassword: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'forgotPassword'
		},
		country: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: '',
			field: 'Country'
		},
		dob: {
			type: DataTypes.STRING(20),
			allowNull: true,
			defaultValue: '',
			field: 'dob'
		},
		gender: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'gender'
		},
		state: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: '',
			field: 'state'
		},
		city: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: '',
			field: 'city'
		},
		age: {
			type: DataTypes.STRING(11),
			allowNull: true,
			defaultValue: '',
			field: 'age'
		},
		notificationStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1',
			field: 'notification_status'
		},
		lat: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: '',
			field: 'lat'
		},
		lng: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: '',
			field: 'lng'
		},
		address: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'address'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'description'
		},
		open_time: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'open_time'
		},
		close_time: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'close_time'
		},
		auth_key: {
			type: DataTypes.STRING(200),
			allowNull: true,
			defaultValue: '',
			field: 'auth_key'
		},
		avg_rating: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'avg_rating'
		},
		strike_count: {
			type: DataTypes.INTEGER(10),
			allowNull: true,
			defaultValue: '0',
			field: 'strike_count'
		},
		review_count: {
			type: DataTypes.INTEGER(10),
			allowNull: true,
			defaultValue: '0',
			field: 'review_count'
		},
		deviceType: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'device_type'
		},
		deviceToken: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'device_token'
		},
		access_token: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'access_token'
		},
		refresh_token: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'refresh_token'
		},
		access_token_save_time: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'access_token_save_time'
		},
		loginType: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1',
			field: 'loginType'
		},
		socialId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '',
			field: 'socialId'
		},
		reward_percentage: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'reward_percentage'
		},
		reward_order_count: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'reward_order_count'
		},
		  subscription_status: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'subscription_status'
    },
    customer_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '',
      field: 'customer_id'
    },
    subscription_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '',
      field: 'subscription_id'
    },
    plan_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '',
      field: 'plan_id'
    },
    card_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '',
      field: 'card_id'
    },
    subscription_json: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '',
      field: 'subscription_json'
    },
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1',
			field: 'status'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		}
	}, {
		tableName: 'users'
	});
};
