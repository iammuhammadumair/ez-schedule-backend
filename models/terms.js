/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('terms', {
		id: {
			type: DataTypes.BIGINT,
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
		terms_spanish: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'terms_spanish'
		},
		policy_spanish: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'policy_spanish'
		},
		barber_term: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'barber_term'
		},
		barber_policy: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'barber_policy'
		},
		status: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: '1',
			field: 'status'
		},
		subscription_price: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'subscription_price'
		},
		subscription_status: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: '1',
			field: 'subscription_status'
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
