const express = require('express');
const router = express.Router();
const fs = require('fs');

let file = fs.readFileSync('cities.json');
let data = JSON.parse(file);

const errorResponse = require('../helper-functions').errorResponse;

router.get('/countries', (req, res, next) => {
    // var countries = []

    // // push all countries to a single array
    // for(var i = 0; i < data.length; i++){
    //     countries.push({id: data[i].id, country: data[i].country});
    // };

    // res.status(200).json(countries);

    var countries = []

    for(var i = 0; i < data.length; i++){
        countries.push(data[i]);
    }

    for(var i = 0; i < countries.length; i++){
        countries[i].name = countries[i].country;
        countries[i].cities = countries[i].states
        delete countries[i].states
        delete countries[i].country;

        for(var j = 0; j < countries[i].cities.length; j++){
            countries[i].cities[j].name = countries[i].cities[j].state
            delete countries[i].cities[j].state
        };
    };

    fs.writeFileSync('cities.json', JSON.stringify(countries) , function (err) {
        if (err) throw err;
        console.log('Replaced!');
      });

    res.status(200).json(countries)
});

router.get('/cities', (req, res, next) => {
    const countryId = req.body.country_id;
    
    if(!countryId) return errorResponse(res, 400, "Country ID must be provided")

    // locate the provided country ID and return its cities.
    const filter = data.filter(country => country.id === countryId);

    if(filter.length !== 1) return errorResponse(res, 404, "Provided country ID is not found")

    res.status(200).json(filter[0]);
});

module.exports = router;