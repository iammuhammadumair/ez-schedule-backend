/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('charities', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'image'
		},	
		
		square_account: {
			type: DataTypes.STRING(255),
			allowNull: true,	
			field: 'square_account'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,	
			field: 'description'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'status'
		},
		amount: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'amount'
		}
		
	}, {
		tableName: 'charities'
	});
};
