var models = require('../models');
var express = require('express');
var router = express.Router();


router.get('/reset', function (req, res, next) {
   
    models.Borrower.truncate().then( function() {      
        return models.Borrower.bulkCreate([
            { name: 'George', daysKept: 5 },
            { name: 'Lindsey', daysKept: 7 },
            { name: 'Henry', daysKept: 3 },
            { name: 'Sam', daysKept: 22 },
            { name: 'Leo', daysKept: 9 },
            { name: 'Lorelei', daysKept: 14 }
        ]);  
    }).then(function() {
        return models.Borrower.findAll();
    }).then(function(borrowers) {
       res.render('borrowers', {
           borrowers: borrowers
       }); 
    }).catch(function(err) {
        next(err);    
    });
    
});

module.exports = router;