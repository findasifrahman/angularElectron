var app = require('express')();
var validatetoken = require('./login').validateTokenAdmin;
var cors = require('cors');
app.use(cors());
var models = require('../models/rolemodels');
//var productmodels = require('../models/productmodels');


app.get("/",function(req,res,next){
    models.findAll({include: [models.users]}).then(result => {
           res.json(result)
           //console.log(result)
       })
       .catch(err  => { res.status(400).send(err);console.log(err)});   
})
app.get("/getbyid",function(req,res,next){
    console.log(req.query.id);
    models.findOne({
        where: {
           id: req.query.id
        }
     }).then(result => {
           res.json(result)
           //console.log(result)
       })
       .catch(err  => {res.status(400).send(err);;console.log(err)});   
})
app.post('/'/*,validatetoken*/ , function(req, res,next){
    console.log("inside add");
    //console.log(req.body);
    let { rolename } = req.body;
    models.create({
        rolename,
    }
    ).then(result => res.status(200).send(result))
    .catch(err => {res.status(400).send(err);console.log(err);});
})
app.put('/'/*,validatetoken*/, function(req, res,next){
    console.log("inside update");
    console.log(req.body.Id);

    let { id,rolename } = req.body;
      // Insert into table
      models.update({
        rolename
      },{ where: { id: req.body.Id } })
        .then(result => res.status(200).send(result))
        .catch(err => {res.status(400).send(err);console.log(err)});
})
app.delete('/',/*validatetoken,*/ (req, res,next) => {
    console.log("inside delete");
    /*productgroupmodel.destroy({
        where: { Id: req.query.id }         
    }).then(result => res.status(200).send({"ok":"ok"}))
    .catch(err => {next(err);console.log(err)});*/
    models.destroy({
        where: { id: req.query.id }         
    }).then(result => {
        models.findAll().then(result => {
            res.json(result)
            //console.log(result)
        })
        .catch(err  => {res.status(400).send(err);console.log(err)}); 
    })
    .catch(err => {res.status(400).send(err);console.log(err)});
});

module.exports = app;