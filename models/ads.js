/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('ads', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		
		
		title: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'title'
		},
		link: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'link'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'image'
		},
		zipcode: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'zipcode'
		},
		mile_radius: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'mile_radius'
		},

		days: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'days'
		},
		timestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 0,
			field: 'timestamp'
		},
		
		
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: 1,
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
		tableName: 'ads'
	});
};
