/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('posts', {
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
		catId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'catId'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'description'
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
		tableName: 'posts'
	});
};
