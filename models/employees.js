"use strict";

module.exports = function (sequelize, DataTypes) {
    var Employee = sequelize.define("Employee", {
        name: DataTypes.STRING
        }, {
            classMethods: {
                associate: function (models) {
                    Employee.belongsTo(models.Employee, { as: 'manager', foreignKey: 'managerId'});
                    Employee.hasMany(models.Employee, { as: 'report', foreignKey: 'managerId'});
                }
            }
    });
    
    return Employee;
}