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

moment.tz.setDefault("America/Vancouver");
app.get('/time',function(req,res){
    res.status(200).send(moment().format('MMMM Do YYYY, h:mm:ss a'));
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
    })

var current_loc = {
    "longtitude" : 110,
    "lantitude"  : 110
}

var dest_loc = {
    "longtitude" : 120,
    "lantitude"  : 120
}

module.exports = {current_loc, dest_loc};


