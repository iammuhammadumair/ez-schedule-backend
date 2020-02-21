/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('terms', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		termsContent: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'terms_content'
		},
		privacyPolicy: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'privacyPolicy'
		},
		status: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: '1',
			field: 'status'
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
			field: 'updatedAt'
		}
	}, {
		tableName: 'terms'
	});
};
