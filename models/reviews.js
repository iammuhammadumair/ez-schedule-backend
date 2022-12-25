/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('reviews', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		from_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'from_id'
		},
		to_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'to_id'
		},
		order_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'order_id'
		},
		type: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'type'
		},
		rating: {
			type: DataTypes.STRING(50),
			allowNull: true,
			field: 'rating'
		},
		review: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'review'
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
		tableName: 'reviews'
	});
};
