const express = require('express');
const router = express.Router();
const fs = require('fs');

let file = fs.readFileSync('cities.json');
let data = JSON.parse(file);

const errorResponse = require('../helper-functions').errorResponse;

router.get('/countries', (req, res, next) => {
    var countries = []

    // push all countries to a single array
    for(var i = 0; i < data.length; i++){
        countries.push({id: data[i].id, name: data[i].name});
    };

    res.status(200).json(countries);
});

router.get('/cities', (req, res, next) => {
    const countryId = Number(req.query.country_id);

    
    if(!countryId) return errorResponse(res, 400, "Country ID must be provided")

    // locate the provided country ID and return its cities.
    const filter = data.filter(country => country.id === countryId);
    console.log(filter)

    if(filter.length !== 1) return errorResponse(res, 404, "Provided country ID is not found")

    res.status(200).json(filter[0].cities);
});

module.exports = router;