/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('postsImages', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		postId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'postId'
		},
		images: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: "",
			field: 'images'
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
		tableName: 'postsImages'
	});
};
