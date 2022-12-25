/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('barbers_time_slot', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		
		
		barber_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'barber_id'
		},
		slot_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'slot_id'
		},
		slot: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'slot'
		},
		start_time: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'start_time'
		},
		start_time_seconds: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'start_time_seconds'
		},
		end_time: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'end_time'
		},		
				
		
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '1',
			field: 'status'
		},
		day: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'day'
		},
		is_close: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'is_close'
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
		tableName: 'barbers_time_slot'
	});
};
