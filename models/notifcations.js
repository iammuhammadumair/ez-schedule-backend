/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('notifcations', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'senderId'
		},
		recieverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'recieverId'
		},
		notiType: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'notiType'
		},
		message: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: '',
			field: 'message'
		},
		data: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'data'
		},
		isRead: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'isRead'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		}
	}, {
		tableName: 'notifcations'
	});
};
