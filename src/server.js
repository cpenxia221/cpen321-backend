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
            res.json({code: 100, sender:result[0].sender})
        }
    })
});

app.use('/acept_invit',(req,res)=>{
    var invitinfo = {
        "sender" : req.body.sender,
        "receiver" : req.body.receiver,
        "op"       : req.body.op
    }
    
    var seeksql =  "select * from invitations where receiver='" + invitinfo.receiver + "'"
    var sender_if_group_sql =  "select * from userinfo where username='" + invitinfo.sender + "'"
    var receiver_if_group_sql = "select * from userinfo where username='" + invitinfo.receiver + "'"
    var delete_invit_sql = "DELETE FROM invitations WHERE receiver='" +  invitinfo.receiver + "'"

    var sender_groupid = -1;
    var receiver_groupid = -1;

    connection.query(sender_if_group_sql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result == ''){
            res.json({code:404,msg:"User not exist!"})
            return
        }
        else if(result[0].groupid != ''){
            sender_groupid = result[0].groupid
        }

    })

    connection.query(receiver_if_group_sql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result == ''){
            res.json({code:404,msg:"User not exist!"})
            return
        }
        else if(result[0].groupid != ''){
            receiver_groupid = result[0].groupid
        }

    })

    connection.query(seeksql,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        if(result == ''){
            res.json({code:401,msg:"Invitation not exist!"})
        }
        else if(result.body.receiver != invitinfo.receiver){
            DB_op(delete_invit_sql)
            res.json({code:404,msg:"Sender not found!"})
        }
        else if(result.body.op == "refuse"){
            DB_op(delete_invit_sql)
            res.json({code:403,msg:"invitation refused!"})
        }
        else if(receiver_groupid != -1){
            DB_op(delete_invit_sql)
            res.json({code:402,msg:"Already grouped!"})
        }
        else{
            addgroup(invitinfo.sender,invitinfo.receiver,sender_groupid)
            DB_op(delete_invit_sql)
            res.json({code:100,msg:"Succeed!"})
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
    var addinvitsql = "insert into invitations(sender,receiver) values('" + invitinfo.sender + "','" + invitinfo.receiver + "')"
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
            connection.query(seeksql,(err1,result2)=>{
                if(err1){
                    console.log(err)
                    return
                }
                if(result2 != ''){
                    res.json({code:403,msg:"Receiver have a invitation pending"})
                    console.log("Receiver have a invitation pending")
                }
                else{
                    connection.query(addinvitsql);
                    res.json({code: 100})
                    console.log("Invitation added succeeded")
                }
            })
        }
    })
  
});

function DB_op(string){
    var result
    connection.query(string,(err,res)=>{
        if(err){
            console.log(string)
            result = -1
        }
        else{
            result = res
        }
    })
    return result
}

function addgroup(sendername,receivername,groupid){
    var id = groupid
    var change_receiver_group = "UPDATE userinfo SET groupid ='" + id + "' WHERE username='" + receivername + "'" 
    var change_sender_group = "UPDATE userinfo SET groupid ='" + id + "' WHERE username='" + sendername + "'" 
    var group_create_sql = "insert into groupsinfo (member1,member2) values ('" + sendername + "','" + receivername + "')"
    var search_groupid = "select * from groupsinfo where member1='" + sendername + "'"
    if(groupid != -1){
         DB_op(change_receiver_group)
         connection.query(search_groupid,(err,res)=>{
            if(err){
            }
            else{
                if(res[0].member3 == null){
                    connection.query("UPDATE groupsinfo SET member3 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
                }
                else if(res[0].member4 == null){
                    connection.query("UPDATE groupsinfo SET member4 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
                }
                else{
                    connection.query("UPDATE groupsinfo SET member5 ='" + receivername + "' WHERE  groupid ='" + groupid + "'")
                }
            }
        })
         return 1
    }
    else{
        DB_op(group_create_sql);
        connection.query(search_groupid,(err,res)=>{
            var op1 = "UPDATE userinfo SET groupid ='" + res[0].groupid + "' WHERE username='" + receivername + "'"
            var op2 = "UPDATE userinfo SET groupid ='" + res[0].groupid + "' WHERE username='" + sendername + "'"
            connection.query(op1)
            connection.query(op2)
            console.log(res)
        })
        // var group = DB_op(search_groupid)
        // console.log(group)
        // id = group[0].groupid
        // DB_op(change_receiver_group)
        // DB_op(change_sender_group)
        return 1
    }
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

module.exports = {DB_op}




