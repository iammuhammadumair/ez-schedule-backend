/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('order_services', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		
		
		order_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'order_id'
		},
		service_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'service_id'
		},
				
		
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '1',
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
		tableName: 'order_services'
	});
};
