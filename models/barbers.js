/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('barbers', {
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
		user_type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 2,
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
		authKey: {
			type: DataTypes.STRING(200),
			allowNull: true,
			defaultValue: '',
			field: 'auth_key'
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
