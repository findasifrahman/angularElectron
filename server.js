var express = require("express");
var app = express(); // express instance
var http = require('http');
var path = require('path');

var passport = require('passport');
//var paeesortSetup = require('./config/passport-setup');
var bodyparser = require("body-parser");
var fileupload = require('./api/fileupload');
var dbcontext = require('./dbcontext');

var alluser = require('./api/alluserapi')
var my_id = require('./api/my_idapi')
var gps_data = require('./api/gps_dataapi')
var groupapi = require('./api/groupapi')
var login = require('./api/login')
var user = require('./api/usermodelapi')
//var synonym = require('./api/synonymapi')

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));


app.use(passport.initialize());
app.use(passport.session());

app.use('/api/alluser',alluser) // ship names of BN
app.use('/api/gpsdata',gps_data)
app.use('/api/myid',my_id)
app.use('/api/group',groupapi)
app.use('/api/user',user) // sytem user

app.use('/picture',fileupload);
app.use('/api/login',login);
//app.use('/api/notii', firebaseN)
app.use('/api/uploads',express.static(__dirname + '/api/uploads'));
app.use('/api/tmpUploads',express.static(__dirname + '/api/tmpUploads'));
const moment = require("moment");
const { DomPortal } = require("@angular/cdk/portal");
 


app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something went wrong!!');
});


/*app.listen(5020,function(){
    console.log("listening to port 5020");
})*/

app.use(express.static(__dirname + '/frontend'));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));


const server = http.createServer(app);
const port  = process.env.port

server.listen(port, () => console.log(`App running on: http://localhost:5020`));

