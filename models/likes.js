/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('likes', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		user_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'user_id'
		},
		barber_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'barber_id'
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue:1,
			field: 'status'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updatedAt'
		}
	}, {
		tableName: 'likes'
	});
};
