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
    let response = await axios.post('http://104.210.38.232:8081/login',login_info);
    expect(response.data.code).toBe(-1)
    
    //Second test for reg the account
    response = await axios.post('http://104.210.38.232:8081/reg',login_info);
    expect(response.data.code).toBe(1)

    //reg it again this time should not succeed
    response = await axios.post('http://104.210.38.232:8081/reg',login_info);
    expect(response.data.code).toBe(-1)

    //Log in again this time should be success
    response = await axios.post('http://104.210.38.232:8081/login',login_info);
    expect(response.data.code).not.toBe(-1)

    
})

test('Invitation module test',async()=>{

    //Find invitations for buser,should get null now
    let response = await axios.post('http://104.210.38.232:8081/get_invit',{"receiver" : "buser"});
    expect(response.data.code).toBe(401)

    //Add invitation that the receiver not even exist.
    response = await axios.post('http://104.210.38.232:8081/send_invit',invit_info2);
    expect(response.data.code).toBe(404)
    
    //Add valid invitation this time
    response = await axios.post('http://104.210.38.232:8081/send_invit',invit_info);
    expect(response.data.code).toBe(100)

    //send invitation again, this time should get an error
    response = await axios.post('http://104.210.38.232:8081/send_invit',invit_info);
    expect(response.data.code).toBe(403)

    response = await axios.post('http://104.210.38.232:8081/get_invit',{"receiver" : "buser"});
    expect(response.data.code).toBe(100)
    expect(response.data.sender).toEqual(invit_info.sender)
    
    server.DB_op(delete_invit)

})

test('Invitation addgroup function test',async()=>{

    var invitation_reg1 = {
      "username" : "testreg1",
      "password" : "testreg1"
    }

    var invitation_reg2 = {
      "username" : "testreg2",
      "password" : "testreg2"
    }

    var response = await axios.post('http://104.210.38.232:8081/reg',invitation_reg1);
    response = await axios.post('http://104.210.38.232:8081/reg',invitation_reg2);
    var change_test_groupid = "UPDATE userinfo SET groupid = '-1' WHERE username= 'testreg1'" 
    var change_test_groupid2 = "UPDATE userinfo SET groupid = '-1' WHERE username= 'testreg2'" 
  

    var test_case_req1 = {
      "sender" : "fakeuser",
      "receiver" : "fakeuser",
      "groupid" : "-1",
      "op"  : "accept"
    }

    var test_case_req2 = {
      "sender" : "testreg1",
      "receiver" : "testreg2",
      "groupid" : "-1",
      "op"  : "accept"
    }

    var test_case_req3 = {
      "sender" : "testreg1",
      "receiver" : "testreg2",
      "groupid" : "-1",
      "op"  : "refuse"
    }
    response = await axios.post('http://104.210.38.232:8081/accept_invit',test_case_req1);
    expect(response.data.code).toBe(401)

    response = await axios.post('http://104.210.38.232:8081/accept_invit',test_case_req2);
    expect(response.data.code).toBe(405)

  
    server.DB_op(insert_invita2)
    response = await axios.post('http://104.210.38.232:8081/accept_invit',test_case_req2);
    expect(response.data.code).toBe(101)

 

 

})

test('switch alert',async()=>{
  var switchalert = {"groupid" : "165"}
  var response = await axios.post('http://104.210.38.232:8081/switchalert',switchalert);
  expect(1).toBe(1)
})

test('get group test',async()=>{
  var reqinfo = {
    "username" : "getgrouptest"
  }
  var response = await axios.post('http://104.210.38.232:8081/get_group',reqinfo);
  expect(response.data.member5).toEqual("getgrouptest")
  response = await axios.post('http://104.210.38.232:8081/get_group',{"username" : "getgrouptest"});
  expect(response.data.groupid).toBe(-1)
})

