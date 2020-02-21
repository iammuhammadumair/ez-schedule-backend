/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('votecasting', {
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
			field: 'userId'
		},
		postId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'postId'
		},
		imageId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'imageId'
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
		tableName: 'votecasting'
	});
};
