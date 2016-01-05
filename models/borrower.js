"use strict";

module.exports = function (sequelize, DataTypes) {
	var Borrower = sequelize.define("Borrower", {
		name: DataTypes.STRING,
		daysKept: DataTypes.INTEGER
	}, {
			classMethods: {
				associate: function (models) {
					Borrower.belongsTo(models.Borrower, { as: 'next', foreignKey: 'nextId' });
					Borrower.hasOne(models.Borrower, { as: 'previous', foreignKey: 'nextId' });
				}
			}
		});
		
	return Borrower;
};