/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('charity_payment', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'user_id'
		},
		charity_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'charity_id'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'description'
		},
		payment_response: {
			type: DataTypes.STRING(255),
			allowNull: true,	
			field: 'payment_response'
		},
		
		amount: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'amount'
		}
	}, {
		tableName: 'charity_payment'
	});
};
