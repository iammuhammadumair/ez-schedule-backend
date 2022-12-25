/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('blogs', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		title: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'title'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'description'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'image'
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
		tableName: 'blogs'
	});
};
