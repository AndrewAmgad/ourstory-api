const express = require('express');
const router = express.Router();
const fs = require('fs');

let file = fs.readFileSync('cities.json');
let data = JSON.parse(file);

const errorResponse = require('../helper-functions').errorResponse;

router.get('/countries', (req, res, next) => {
    var countries = []
    for(var i = 0; i < data.length; i++){
        countries.push({id: data[i].id, country: data[i].country});
    }
    res.status(200).json(countries);
});

router.get('/cities', (req, res, next) => {
    const countryId = req.body.country_id;
    
    if(!countryId) return errorResponse(res, 400, "Country ID must be provided")

    const filter = data.filter(country => country.id === countryId);

    res.status(200).json(filter);
});

module.exports = router;