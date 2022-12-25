/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('orders', {
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
		date: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'date'
		},
		slot_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1',
			field: 'slot_id'
		},
		slot_count: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'slot_count'
		},
		end_time: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'end_time'
		},
		start_time: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'start_time'
		},
		services: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'services'
		},
		info: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'info'
		},			
		
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'status'
		},
		is_self: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'is_self'
		},
		is_rewarded: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'is_rewarded'
		},
		
		total_amount: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '0',
			field: 'total_amount'
		},
		payment_response: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'payment_response'
		},
		payment_status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'payment_status'
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
		tableName: 'orders'
	});
};
