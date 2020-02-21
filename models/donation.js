/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('donation', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'user_id'
		},
		transactionId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'transactionId'
		},
		amount: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'amount'
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
		tableName: 'donation'
	});
};
