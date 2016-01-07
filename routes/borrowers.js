var models = require('../models');
var express = require('express');
var router = express.Router();
var Promise = require("bluebird");

var createBorrower = function(name, daysKept) {
    return models.Borrower.findOne({
        where: { nextId: { $eq: null } }
    }).then(function (lastUser) {
        if (!lastUser) {
            return models.Borrower.create({ name: name, daysKept: daysKept });
        } else {
            return models.Borrower.create({
                name: name,
                daysKept: daysKept
            }).then(function (borrower) {
                return lastUser.setNext(borrower);
            });
        }
    });
}


router.get('/', function(req, res) {
   
    models.Borrower.findAll().then(function (borrowers) {
        res.render('borrowers', {
            borrowers: borrowers
        });
    });
});

router.post('/create', function(req, res) {
    
    createBorrower(
        req.body.name, req.body.daysKept
        ).then(function () {
            res.redirect('/borrowers/');
        });
        
});

router.get('/reset', function (req, res, next) {
   
    models.Borrower.truncate().then(function () {
        return Promise.mapSeries([
            { name: 'George', daysKept: 5 },
            { name: 'Lindsey', daysKept: 7 },
            { name: 'Henry', daysKept: 3 },
            { name: 'Sam', daysKept: 22 },
            { name: 'Leo', daysKept: 9 },
            { name: 'Lorelei', daysKept: 14 }
        ], function (newBorrower) {
            return createBorrower(newBorrower.name, newBorrower.daysKept);
        });
    }).then(
        models.sequelize.sync()
    ).then(function () {
        res.redirect('/borrowers/');
    }).catch(function (err) {
        next(err);
    });
    
});

module.exports = router;

//.then(models.Borrower.findAll({
//        where: { name : ['George', 'Lindsey'] }
//    }).then(function(borrowers) { 
//        return associate('George', 'Lindsey', borrowers);
//    })