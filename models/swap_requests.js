/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('swap_requests', {
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
		from_order_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'from_order_id'
		},
		to_order_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'to_order_id'
		},
		to_user_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'to_user_id'
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
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
		tableName: 'swap_requests'
	});
};
