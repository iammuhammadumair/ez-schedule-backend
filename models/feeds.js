/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('feeds', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		user_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'user_id'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'image'
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
		tableName: 'feeds'
	});
};
