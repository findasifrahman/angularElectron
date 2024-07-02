var app = require('express')();
//var validatetoken = require('./login').validateTokenAdmin;
var moment = require('moment')
var cors = require('cors');
app.use(cors());


var model = require('../models/usergroupmodels');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var moment = require('moment');

app.get("/",function(req,res,next){
    console.log("inside get")
    model.findAll().then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.post('/', function(req, res,next){
    console.log("inside add");
    //console.log(req.body);
    //req.body.uploadDate = moment().format('YYYY-MM-DD')
    //req.body.category = parseInt(moment(req.body.date).format('YYYY'))
    let {gr_name,gr_number,no_of_membar,membar_id,members } = req.body;
    model.create({
        gr_name,gr_number,no_of_membar,membar_id,members 
    }).then(result => {
        res.status(200).send(result)
      
    })
    .catch(err => {res.status(400).send(err);console.log(err);});
})
app.put('/', function(req, res,next){
    console.log("inside update");
    //console.log(req.body.Id);
    //console.log(req.body);
    //req.body.category = parseInt(moment(req.body.date).format('YYYY'))
    let {gr_name,gr_number,no_of_membar,membar_id,members  } = req.body;
      // Insert into table
    model.update({
        gr_name,gr_number,no_of_membar,membar_id,members 
      },{ where: { id: req.body.Id } })
        .then(result => res.status(200).send(result))
        .catch(err => {res.status(400).send(err);console.log(err)});
})
app.delete('/', (req, res,next) => {
    console.log("inside delete");

    model.destroy({
        where: { id: req.query.id }         
    }).then(result => {
        model.findAll().then(result => {
            res.json(result)
            //console.log(result)
        })
        .catch(err  => {res.status(400);console.log(err)}); 
    })
    .catch(err => {res.status(400);console.log(err)});
});
app.get("/getbyid",function(req,res,next){
    //console.log(req.query.id);
    model.findOne({
        where: {
           id: req.query.id
        }
     }).then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})


module.exports = app;