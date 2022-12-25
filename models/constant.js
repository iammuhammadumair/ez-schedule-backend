/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('constant', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userid: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'userid'
		},
		user2Id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'user2id'
		},
		lastMsgId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'last_msg_id'
		},
		typing: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '0',
			field: 'typing'
		},
		deletedId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'deleted_id'
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
		tableName: 'constant'
	});
};
