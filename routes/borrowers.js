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
};


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

router.get('/first20days', function (req, res, next) {
  models.Borrower.findAll({
    cte: [{
      name: 'a',
      model: models.Borrower,
      cteAttributes: ['totalDays'],
      initial: {
        totalDays: { $col: 'Borrowers.daysKept' },
        where: { Borrowers: { name: 'George' } }
      },
      recursive: {
        totalDays: {
          $add: [
            { $col: 'Borrowers.daysKept' },
            { $col: 'a.totalDays' }
          ]
        },
        find: 'next',
        where: {
          a: {
            totalDays: {
              $lt: 20
            }
          }
        }
      }
    }],
    cteSelect: 'a'
  }).then(function (borrowers) {
    res.render('borrowers', {
      borrowers: borrowers
    });
  }).catch(function(err) {
    next(err);
  });
});

router.get('/last3borrowers', function (req, res, next) {
  models.Borrower.findAll({
    cte: [{
      name: 'a',
      model: models.Borrower,
      cteAttributes: ['numberCounted'],
      initial: {
        numberCounted: 1,
        where: { Borrowers: { nextId: { $eq: null } } }
      },
      recursive: {
        numberCounted: {
          $add: [
            { $col: 'a.numberCounted' },
            1
          ]
        },
        find: 'previous',
        where: {
          a: {
            numberCounted: {
              $lt: 3
            }
          }
        }
      }
    }],
    cteSelect: 'a'
  }).then(function (borrowers) {
    res.render('borrowers', {
      borrowers: borrowers
    });
  }).catch(function(err) {
    next(err);
  });
});


module.exports = router;