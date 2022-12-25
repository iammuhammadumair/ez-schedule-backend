/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('block_dates', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		barber_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'barber_id'
		},
		block_date: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'block_date'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0,
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
		tableName: 'block_dates'
	});
};
