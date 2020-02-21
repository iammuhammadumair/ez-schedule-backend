/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('admin', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(20),
			allowNull: false,
			field: 'name'
		},
		email: {
			type: DataTypes.STRING(20),
			allowNull: false,
			field: 'email'
		},
		phone: {
			type: DataTypes.STRING(200),
			allowNull: false,
			field: 'phone'
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'image'
		},
		password: {
			type: DataTypes.STRING(70),
			allowNull: false,
			field: 'password'
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
			field: 'updated_at'
		}
	}, {
		tableName: 'admin'
	});
};
