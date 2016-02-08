"use strict";

module.exports = function (sequelize, DataTypes) {
	var Borrower = sequelize.define("Borrower", {
		name: {
            type: DataTypes.STRING,
            validate: { isAlpha: true}
        },
		daysKept: DataTypes.INTEGER
	}, {
			classMethods: {
				associate: function (models) {
					Borrower.belongsTo(models.Borrower, { as: 'next', foreignKey: 'nextId' });
					Borrower.hasOne(models.Borrower, { as: 'previous', foreignKey: 'nextId' });
				}
			},
            scopes: {
                nextTwentyDays: function(username) {
                    return {
                        cte: [{
                            name: 'twentyDays',
                            cteAttributes: ['totalDays'],
                            initial : {
                                totalDays: { $model: 'daysKept'},
                                where: { name: username}
                            },
                            recursive: {
                                totalDays: {
                                    $add: [
                                        { $model: 'daysKept'},
                                        { $cte: 'totalDays' }
                                    ]},
                                 next: 'next',
                                 where: {
                                    cte: { totalDays: { $lt: 20} }
                                 } 
                            }
                        }],
                        includeCTEAttributes: ['totalDays'],
                        cteSelect: 'twentyDays'  
                    };
                }
            }
		});
		
	return Borrower;
};