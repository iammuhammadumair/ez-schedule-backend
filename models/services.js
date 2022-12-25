/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('services', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'name'
		},
		name_spanish: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'name_spanish'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'description'
		},
		category_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'category_id'
		},
		barber_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'barber_id'
		},
		price: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'price'
		},
		duration: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'duration'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'image'
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
		tableName: 'services'
	});
};
