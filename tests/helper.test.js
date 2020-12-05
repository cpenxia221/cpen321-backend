//import { expect, test } from '@jest/globals';
//import functions  from 'server.js';

const helper = require('../src/helper');

test('getDistance test',() =>{
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

const mockCallback = jest.fn(x => 5134);

test('timeRemain test',() =>{
    expect(helper.getTimeRemain(3619,mockCallback)).toBe(1515);
})