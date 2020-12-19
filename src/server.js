var express = require('express');
var moment = require('moment-timezone');
var mysql = require('mysql');


var app = express();
app.use(express.json());

var mysql_info ={
    host: 'localhost',
    user: 'root',
    password: 'cpen321',
    database: 'cpen321'
};

var connection = mysql.createConnection(mysql_info);

connection.connect(function(err){
    if(err){
        console.log('connection failed' + err);
        connection.end();
        return;
    }
    console.log('connection succeed.');
});

// tested
app.use('/login',function(req, res){
    var login_info = {
        "username": req.body.username,
        "password" : req.body.password
    }
    var loginsql = "select * from userinfo where username='" + login_info.username + "'and password='" + login_info.password + "'"
    connection.query(loginsql,(err,result)=>{
        if(err){
            console.log('search failed, err:',err)
            return
        }
        if(result == ''){
            console.log('username or password wrong!')
            res.json({code: -1, msg:'username or password wrong!'})
        }
        else{
            console.log('log in succeed!')
            res.json({code: result[0].id, msg:'log in succeed!'})
        }
    })
});

//tested
app.use('/reg',(req,res)=>{
    var reginfo = {
        "username" : req.body.username,
        "password" : req.body.password
    }
    var regsql = "insert into userinfo(username,password) values('" + reginfo.username + "','" + reginfo.password + "')"
    var seeksql =  "select * from userinfo where username='" + reginfo.username + "'"

    connection.query(seeksql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result != ''){
            res.json({code:-1,msg:"Sign up failed, username already exist!"})
            console.log(reginfo.username+ 'Username already exist!')
        }
        else{
            connection.query(regsql, (err2,result2)=>{
                if(err){
                    console.log(err2)
                    return
                }
                res.json({code:1,msg:"Sign up succeed!"})
                console.log('Sign up succeed!')
            })
        }
    })
});

//tested
app.use('/get_invit',(req,res)=>{
    var invitinfo = {
        "receiver" : req.body.receiver
    }
    var seeksql =  "select * from invitations where receiver='" + invitinfo.receiver + "'"

    connection.query(seeksql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result == ''){
            res.json({code:401,msg:"Invitation not exist!"})
        }
        else{
            res.json({code: 100, invitations:result[0]})
        }
    })
});

app.use('/accept_invit',(req,res)=>{
    var invitinfo = {
        "sender" : req.body.sender,
        "receiver" : req.body.receiver,
        "groupid"  : req.body.groupid,
        "op"       : req.body.op
    }
    
    var seeksql =  "select * from invitations where receiver='" + invitinfo.receiver + "'"
    var sender_if_group_sql =  "select * from userinfo where username='" + invitinfo.sender + "'"
    var receiver_if_group_sql = "select * from userinfo where username='" + invitinfo.receiver + "'"
    var delete_invit_sql = "DELETE FROM invitations WHERE receiver='" +  invitinfo.receiver + "'"

    //var sender_groupid = -1;
    //var receiver_groupid = -1;
    connection.query(sender_if_group_sql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result == ''){
            res.json({code:401,msg:"sender not exist!"})
        }
        else{
            var receiver_groupid = result[0].groupid
            connection.query(seeksql,(err2,result2)=>{
                console.log(receiver_groupid)
                if(err2){
                    console.log(err)
                    return
                }
                if(result2 == ''){
                    res.json({code:405,msg:"Invitation not exist!"})
                    DB_op(delete_invit_sql)
                }
                else if(result2[0].sender != invitinfo.sender){
                    DB_op(delete_invit_sql)
                    res.json({code:404,msg:"sender not match!"})
                }
                else if(invitinfo.op == "refuse"){
                    DB_op(delete_invit_sql)
                    res.json({code:403,msg:"invitation refused!"})
                }
                else if(receiver_groupid != "-1"){
                    DB_op(delete_invit_sql)
                    res.json({code:402,msg:"Already grouped!"})
                }
                else if(invitinfo.groupid != -1){
                    DB_op(delete_invit_sql)
                    addgroup(invitinfo.sender,invitinfo.receiver,invitinfo.groupid)
                    res.json({code:100,msg:"Succeed!"})
                }
                else if(invitinfo.groupid == -1){
                    DB_op(delete_invit_sql)
                   // creategroup(invitinfo.sender,invitinfo.receiver)
                    creategroup(invitinfo.sender,invitinfo.receiver)
                    res.json({code:101,msg:"Succeed2!"})
                }
            })
        }
    })


});

// tested
app.use('/send_invit',(req,res)=>{
    var invitinfo = {
        "sender" : req.body.sender,
        "receiver" : req.body.receiver,
    }
    var seeksql =  "select * from invitations where receiver='" + invitinfo.receiver + "'"
    var seekusersql =  "select * from userinfo where username='" + invitinfo.receiver + "'" 
    var seeksendersql =  "select * from userinfo where username='" + invitinfo.sender + "'" 
    
    connection.query(seekusersql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result == ''){
            res.json({code:404,msg:"Receiver id not found"})
            console.log("Receiver id not found")
        }
        else{
            connection.query(seeksql,(err2,result2)=>{
                if(err2){
                    console.log(err2)
                    return
                }
                if(result2 != ''){
                    res.json({code:403,msg:"Receiver have a invitation pending"})
                    console.log("Receiver have a invitation pending")
                }
                else{
                    connection.query(seeksendersql,(err3,result3)=>{
                        var addinvitsql = "insert into invitations(sender,receiver,groupid) values('" + invitinfo.sender + "','" + invitinfo.receiver + "','" + result3[0].groupid + "')"
                        connection.query(addinvitsql);
                        res.json({code: 100})
                        console.log("Invitation added succeeded")
                    })
                }
            })
        }
    })
  
});


app.use('/get_group',(req,res)=>{
    var userinfo = {
        "username" : req.body.username
    }
 var seekusersql =  "select * from userinfo where username='" + userinfo.username + "'" 
 connection.query(seekusersql,(err,res1)=>{
        if(err){
            console.log("error!")
            result = -1
        }
        else{
            if(res1[0].groupid == -1){
                res.json({groupid : -1})  
            }
            else{
                var seekgroupsql = "select * from groupsinfo where groupid='" + res1[0].groupid + "'"
                connection.query(seekgroupsql,(err2,res2)=>{
                    res.json({groupid: res2[0].groupid,member1: res2[0].member1,member2: res2[0].member2,member3: res2[0].member3,member4: res2[0].member4,member5: res2[0].member5,alert: res2[0].alert})
                })
            }
            
        }
    })
})

app.use('/switchalert',(req,res)=>{
    var reqinfo = {
        "groupid" : req.body.groupid
    }
    var seekgroupsql = "select * from groupsinfo where groupid='" + reqinfo.groupid + "'"
    connection.query(seekgroupsql,(err,res)=>{
        if(err){
            console.log("error!")
            result = -1
        }
        else{
            if(res[0].alert == 0){
                var turnOnAlertsql = "UPDATE groupsinfo SET alert ='" + "1" + "' WHERE groupid='" + reqinfo.groupid + "'" 
                connection.query(turnOnAlertsql)
            }
            else if(res[0].alert == 1){
                var turnOnAlertsql2 = "UPDATE groupsinfo SET alert ='" + "0" + "' WHERE groupid='" + reqinfo.groupid + "'" 
                connection.query(turnOnAlertsql2)
            }
        }
    })
})


function DB_op(string){
    var result
    connection.query(string,(err,res)=>{
        if(err){
            console.log("error!")
            result = -1
        }
        else{
            result = res
        }
    })
    return result
}

function addgroup(sendername,receivername,groupid){
   
    var change_receiver_group = "UPDATE userinfo SET groupid ='" + groupid + "' WHERE username='" + receivername + "'" 
    var change_sender_group = "UPDATE userinfo SET groupid ='" + groupid + "' WHERE username='" + sendername + "'" 
   
    var search_groupid = "select * from groupsinfo where groupid='" + groupid + "'"

    connection.query(search_groupid,(err,res)=>{   
        if(res[0].member1 == null) {
            connection.query("UPDATE groupsinfo SET member1 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
            connection.query(change_receiver_group)
        }
        if(res[0].member2 == null) {
            connection.query("UPDATE groupsinfo SET member2 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
            connection.query(change_receiver_group)
        }
        else if(res[0].member3 == null){
            connection.query("UPDATE groupsinfo SET member3 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
            connection.query(change_receiver_group)
        }
        else if(res[0].member4 == null){
            connection.query("UPDATE groupsinfo SET member4 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
            connection.query(change_receiver_group)
        }
        else if(res[0].member5 == null){
            connection.query("UPDATE groupsinfo SET member5 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
            connection.query(change_receiver_group)
        }
        else{
            console.log("group full!")
        }
    })
 
    
}

function creategroup(sendername,receivername){
    var group_create_sql = "insert into groupsinfo (member1,member2) values ('" + sendername + "','" + receivername + "')"
    var search_by_name = "select * from groupsinfo where member1='" + sendername + "'"
    DB_op(group_create_sql);
    connection.query(search_by_name,(err,res)=>{
        var op1 = "UPDATE userinfo SET groupid ='" + res[0].groupid + "' WHERE username='" + receivername + "'"
        var op2 = "UPDATE userinfo SET groupid ='" + res[0].groupid + "' WHERE username='" + sendername + "'"
        DB_op(op1)
        DB_op(op2)
        console.log(res)
    })
}



moment.tz.setDefault("America/Vancouver");
app.get('/time',function(req,res){
    res.status(200).send(moment().format('MMMM Do YYYY, h:mm:ss a'));
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
    })

module.exports = {DB_op,addgroup,creategroup}




