/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('blockedUser', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userby: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'userby'
		},
		userto: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'userto'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'status'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: true,
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
		tableName: 'blocked_user'
	});
};
