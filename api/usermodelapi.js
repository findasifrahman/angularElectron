
var app = require('express')();

var model = require('../models/usermodels');
const Sequelize = require('sequelize');
var cors = require('cors');
app.use(cors());

app.get("/"/*,validatetoken*/,function(req,res,next){
    model.findAll().then(result => {
           res.json(result)
           //console.log(result)
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
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})

app.post('/'/*,validatetoken*/, function(req, res,next){
    console.log("inside add");
    //console.log(req.body);
    let {  username,roleId,password } = req.body;
    model.create({
        username,roleId,password
    }
    ).then(result => res.status(200).send(result))
    .catch(err => {res.status(400).send(err);console.log(err);});
})
app.put('/'/*,validatetoken*/, function(req, res,next){
    console.log("linside update");
    console.log(req.body.Id);
    //console.log(req.body.employeid)
    //console.log(req.body);
    //console.log("la la");
    let { id,username,roleId,password } = req.body;
      // Insert into table
      model.update({
        username,roleId,password
      },{ where: { id: req.body.Id } })
        .then(result => res.status(200).send(result))
        .catch(err => {res.status(400).send(err);console.log(err)});
})
app.delete('/',/*validatetoken,*/ (req, res,next) => {
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
module.exports = app