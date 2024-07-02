var app = require('express')();
//var validatetoken = require('./login').validateTokenAdmin;

var cors = require('cors');
app.use(cors());
var model = require('../models/coursenamemodels');
var detmodel = require('../models/foreignmodels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var moment = require('moment');
const { query } = require('express');
app.get("/"/*,validatetoken*/,function(req,res,next){
    detmodel.findAll().then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.get("/allDetails",function(req,res,next){
    detmodel.findAll().then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.get("/getbyid",function(req,res,next){
    console.log(req.query.id);
    model.findOne({
        where: {
           id: req.query.id
        }
     }).then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.get("/getbydate",function(req,res,next){
   // moment(new Date()).isBetween(moment(x.startDate), moment(x.endDate),undefined, '[]')
    console.log("HHHHBHBHBHB",req.query.time1);
    detmodel.findAll({
        where: {
            endDate: {
                [Op.gte]: new Date(req.query.time1)
            },
        }
     }).then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.get("/getbydatecountry",function(req,res,next){
    // moment(new Date()).isBetween(moment(x.startDate), moment(x.endDate),undefined, '[]')
     console.log("HHHHBHBHBHB",req.query.time1, req.query.school);
     detmodel.findAll({
         where: {
             endDate: {
                 [Op.gte]: new Date(req.query.time1)
             },countryName: req.query.country
         }
      }).then(result => {
            res.json(result)
            console.log(result)
        }).catch(err  => {res.status(400).send(err);console.log(err)});   
 })
 
app.get("/getbydatecountrymultiple",function(req,res,next){
    // moment(new Date()).isBetween(moment(x.startDate), moment(x.endDate),undefined, '[]')
     console.log("HHHHBHBHBHB",req.query.time1, req.query.country);
     detmodel.findAll({
         where: {
             endDate: {
                 [Op.gte]: new Date(req.query.time1)
             },countryName: [req.query.country]
         }
      }).then(result => {
            res.json(result)
            console.log(result)
        }).catch(err  => {res.status(400).send(err);console.log(err)});   
 })
app.get("/getbycourseid",function(req,res,next){
    console.log(req.query.id);
    detmodel.findOne({
        where: {
           id: req.query.id
        }
     }).then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.post('/', function(req, res,next){
    console.log("inside add");
    console.log(req.body);
    let {countryName,courseName,noOfCandidates,duration,startDate,endDate,remarks,type,noOfOficer,noOfForeignStudent,
    noOfSailor,noOfInterService,noOfCivilian,noOfForeigner,noOfCadet,noOfMidShipman } = req.body;
    detmodel.create({
        countryName,courseName,noOfCandidates,duration,startDate,endDate,remarks,type,noOfOficer,noOfForeignStudent,
        noOfSailor,noOfInterService,noOfCivilian,noOfForeigner,noOfCadet,noOfMidShipman
    
    }).then(result => {
        res.status(200).send(result)
      
    })
    .catch(err => {res.status(400).send(err);console.log(err);});
})
/*app.post('/', function(req, res,next){
    console.log("inside add");
    console.log(req.body);
    let {schoolName } = req.body;
    model.create({
        schoolName
    
    }).then(result => {
        console.log("end result-",result.id, result.schoolName)
        let newarr = req.body.items
        let an = []
        let nn = newarr.map((v,index) => {
             v.courseId = result.id
             an.push(v)
             if(index == newarr.length - 1){
                detmodel.bulkCreate(an).then(nn =>{
                    console.log("nn-", nn)
                    res.status(200).send(result)
                })  
             }
        })
      
    })
    .catch(err => {res.status(400).send(err);console.log(err);});
})*/
app.put('/'/*,validatetoken*/, function(req, res,next){
    console.log("linside update");
    console.log(req.body.Id);

    let {countryName,courseName,noOfCandidates,duration,startDate,endDate,remarks,type,noOfOficer,noOfForeignStudent,
        noOfSailor,noOfInterService,noOfCivilian,noOfForeigner,noOfCadet,noOfMidShipman } = req.body;
      // Insert into table
      detmodel.update({
        countryName,courseName,noOfCandidates,duration,startDate,endDate,remarks,type,noOfOficer,noOfForeignStudent,
        noOfSailor,noOfInterService,noOfCivilian,noOfForeigner,noOfCadet,noOfMidShipman
      },{ where: { id: req.body.Id } })
        .then(result => res.status(200).send(result))
        .catch(err => {res.status(400).send(err);console.log(err)});
})
/*app.put('/', function(req, res,next){
    console.log("linside update");
    console.log(req.body.Id);
    //console.log(req.body);
    console.log("la la");
    let {id,schoolName } = req.body;
      // Insert into table
      model.update({
        schoolName
      },{ where: { id: req.body.Id } })
        .then(result => {
            detmodel.destroy({
                where: { courseId: req.body.Id } 
            }).then(cresult => {
                let newarr = req.body.items
                let an = []
                let nn = newarr.map((v,index) => {
                     v.courseId = req.body.Id
                     an.push(v)
                     if(index == newarr.length - 1){
                        detmodel.bulkCreate(an).then(nn =>{
                            console.log("nn-", nn)
                            res.status(200).send(result)
                        })  
                     }
                })
            }).catch(err  => {res.status(400);console.log(err)}); 
            //res.status(200).send(result)
        })
        .catch(err => {res.status(400).send(err);console.log(err)});
})*/
app.delete('/',/*validatetoken,*/ (req, res,next) => {
    console.log("inside delete");

    detmodel.destroy({
        where: { id: req.query.id } 
    }).then(result => {
        detmodel.findAll().then(result => {
            res.json(result)
            //console.log(result)
        })
        .catch(err  => {res.status(400);console.log(err)}); 
       /* model.destroy({
            where: { id: req.query.id }         
        }).then(result => {
            model.findAll().then(result => {
                res.json(result)
                //console.log(result)
            })
            .catch(err  => {res.status(400);console.log(err)}); 
        })
        .catch(err => {res.status(400);console.log(err)});*/
    }).catch(err  => {res.status(400);console.log(err)}); 

});

module.exports = app;