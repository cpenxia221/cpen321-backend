//import { expect, test } from '@jest/globals';
//import functions  from 'server.js';

const helper = require('../src/helper');

test('DB connection test',() =>{
    expect(helper.getDistanceFromLatLonInKm(current_loc.lantitude,current_loc.longtitude,dest_loc.lantitude,dest_loc.longtitude)).toBeCloseTo(2319);
})

var current_loc = {
    "longtitude" : 50,
    "lantitude"  : 60
}

var dest_loc = {
    "longtitude" : 70,
    "lantitude"  : 80
}