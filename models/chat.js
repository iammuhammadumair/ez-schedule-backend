/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('chat', {
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
		user2Id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'user2id'
		},
		constantid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'constantid'
		},
		message: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'message'
		},
		msgType: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'msg_type'
		},
		deletedId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'deleted_id'
		},
		readStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'read_status'
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
		tableName: 'chat'
	});
};
