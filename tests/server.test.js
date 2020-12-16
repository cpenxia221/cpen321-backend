const helper = require('../src/helper');
const axios = require('axios')
const server = require('../src/server');


var login_info = {
    "username": "testlogin",
    "password" : "testlogin"
  }

var invit_info = {
    "sender": "auser",
    "receiver": "buser"
}

var invit_info2 = {
    "sender": "auser",
    "receiver": "wronguser"
}

  var delete_sql = "DELETE FROM `cpen321`.`userinfo` WHERE (`username` = 'testlogin')"
  var delete_invit = "DELETE FROM `cpen321`.`invitations` WHERE (`receiver` = 'buser')"

  test('log in and sign up module test',async()=>{

    // First test case for not sign up yet.
    let response = await axios.post('http://localhost:8081/login',login_info);
    expect(response.data.code).toBe(-1)
    
    //Second test for reg the account
    response = await axios.post('http://localhost:8081/reg',login_info);
    expect(response.data.code).toBe(1)

    //reg it again this time should not succeed
    response = await axios.post('http://localhost:8081/reg',login_info);
    expect(response.data.code).toBe(-1)

    //Log in again this time should be success
    response = await axios.post('http://localhost:8081/login',login_info);
    expect(response.data.code).not.toBe(-1)

    server.DB_op(delete_sql)
})

test('Invitation module test',async()=>{

    //Find invitations for buser,should get null now
    let response = await axios.post('http://localhost:8081/get_invit',{"receiver" : "buser"});
    expect(response.data.code).toBe(401)

    //Add invitation that the receiver not even exist.
    response = await axios.post('http://localhost:8081/send_invit',invit_info2);
    expect(response.data.code).toBe(404)
    
    //Add valie invitation this time
    response = await axios.post('http://localhost:8081/send_invit',invit_info);
    expect(response.data.code).toBe(100)

    //send invitation again, this time should get an error
    response = await axios.post('http://localhost:8081/send_invit',invit_info);
    expect(response.data.code).toBe(403)

    response = await axios.post('http://localhost:8081/get_invit',{"receiver" : "buser"});
    expect(response.data.code).toBe(100)
    expect(response.data.sender).toEqual(invit_info.sender)
    
    server.DB_op(delete_invit)

    
})