/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('onlineUser', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'userid'
		},
		socketId: {
			type: DataTypes.STRING(50),
			allowNull: true,
			field: 'socket_id'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'status'
		},
		createdAt: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'updated_at'
		}
	}, {
		tableName: 'online_user'
	});
};
