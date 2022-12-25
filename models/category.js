/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('category', {
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
			field: 'name'
		},
		name_spanish: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name_spanish'
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1',
			field: 'status'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'image'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		}
	}, {
		tableName: 'category'
	});
};
