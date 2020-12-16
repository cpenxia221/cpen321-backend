
//const server_data = require('./server')
const moment = require('moment-timezone');
const axios = require('axios');

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return Math.round(d);
  }
  
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function getTimeRemain(cur_time,get_dest){
  return get_dest() - cur_time;
}

var current_loc = {
  "longtitude" : 110,
  "lantitude"  : 110
}

var dest_loc = {
  "longtitude" : 120,
  "lantitude"  : 120
}

var login_info = {
  "username": 'testlogin',
  "password" : 'testlogin'
}



async function logintest_helper(){
  const respose = await axios.post('http://localhost:8081/login',login_info);
  return respose;
}


module.exports = {getDistance, getTimeRemain,current_loc, dest_loc,logintest_helper};