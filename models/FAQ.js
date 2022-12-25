/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('faq', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		questions: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'questions'
		},
		answers: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'answers'
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
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
		tableName: 'faq'
	});
};
