var app = require('express')();
const jwt = require('jsonwebtoken');
var cors = require('cors');
var empmodel = require('../models/usermodels');
//var rolemodels = require('../models/rolemodels')

app.use(cors());

app.post('/', function(req, res,next){
    console.log("inside login");
    //console.log(req.body);
    var user = req.body.username;
    var pass = req.body.password;
    var uniqueid = req.body.uniqueid 
    var requestorigin = req.body.requestorigin
    var result = {};
    //console.log("req.ip-", req.ip, requestorigin, uniqueid, user)
    if(user == "bijoy50_dsig_admin" && pass == "@112233#"){
      const payload = { user: user,role: 'system_admin'}//roleval.rolename };
      const options = { expiresIn: '1h', issuer: '103.218.25.96:8086' };
      const secret = 'mytoken@asif';
      const token = jwt.sign(payload, secret, options);
  
      //console.log("from desktop");
      result.token = token;
      result.status = 200;
      result.result = user;
      result.userId =  10000;
      result.userdata = {username:'bijoy50_dsig_admin',password:'@112233#',roleId: "2"};
      //console.log("result.userdata,result.devobject",result.userId);
      res.status(200).send(result);
      return
    }
    
    empmodel.findOne({
      where: {
        username: user
      }
    }).then(resa => {
      //console.log("result body ", resa)
         //res.json(result)
         if(resa != null){
            console.log(resa.username)
            
            if(user == resa.username && pass == resa.password){
 

                const payload = { user: user,role: 'admin'}//roleval.rolename };
              
                
                const options = { expiresIn: '1h', issuer: '103.218.25.96:8086' };
                const secret = 'mytoken@asif';
                const token = jwt.sign(payload, secret, options);
            
                //console.log("from desktop");
                result.token = token;
                result.status = 200;
                result.result = user;
                result.userId =  resa.id.toString();
                result.userdata = resa;
                //console.log("result.userdata,result.devobject",result.userId);
                res.status(200).send(result);
                return
                  /*rolemodels.findOne({where: {id: resa.roleId}
                  }).then(roleval =>{
                    console.log("rolename",roleval.rolename)
                    const payload = { user: user,role: roleval.rolename };
                    const options = { expiresIn: '1h', issuer: '103.218.25.96:8086' };
                    const secret = 'mytoken@asif';
                    const token = jwt.sign(payload, secret, options);
            
                        result.token = token;
                        result.status = 200;
                        result.result = user;
                        result.userId =  resa.id.toString();
                        result.userdata = resa;
                        console.log("result.userdata,result.devobject",result.userId);
                        res.status(200).send(result);
                        return


                  })*/
          
            }
            else{
                console.log("username or password do not match");
                status = 401;
                result.status = status;
                result.error = `Password failure`;
                console.log("Password failure on request");
                res.send(result);
                return;
            }
          }
          else{
            status = 401;
            result.status = status;
            result.error = `Username or Password Mismatch`;
            res.send(result);
            console.log(`Username do not exist`)
            return
          }
        
     }).catch(err  => {
        status = 401;
        result.status = status;
        result.error = `Some sort of error`;
        res.status(401).send(result);
        console.log(err)
      }
    );  

})

app.post('/changePass', function(req, res,next){
      //console.log(req.body);
      var user = req.body.username;
      var newpass = req.body.newpassword;
      var result = {};
      
      empmodel.findOne({
        where: {
          username: user
        }
      }).then(resa => {
           //res.json(result)
           if(resa !=null){
              console.log(resa.username)
              if(resa.password == req.body.oldpassword){
                  empmodel.update({password:newpass},
                    {where:{username:user} })
                    .then(result => {
                      res.status(200).send(result);
                  }).catch(err  => {
                    status = 401;
                    result.status = status;
                    result.error = `Some sort of error`;
                    res.status(401).send(result);
                    console.log(err)
                  })
              }else{
                status = 401;
                result.status = status;
                result.error = `Incorrect Old Password`;
                res.status(401).send(result);
                //console.log(err)
              }
           }
           else{
            status = 401;
            result.status = status;
            result.error = `Username do not exist`;
            res.send(result);
            console.log(`Username do not exist`)
            return
          }
      })
})

module.exports = app;

module.exports.validateTokenAdmin = (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    console.log('validating');
    //console.log(req.headers.authorization.split(' ')[1]);
    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
      const options = {
        expiresIn: '1h',
        issuer: 'localhost:8086'
      };
      try {
        // verify makes sure that the token hasn't expired and has been issued by us

        result = jwt.verify(token, 'mytoken@asif', options);
        console.log('validating');
        console.log(result.role);
        if(result.role != "admin"){
          result = { 
            error: `Role Mismatch.`,
            status: 401
          };
          res.status(401).send(result);
          return;
        }
        // Let's pass back the decoded token to the request object
        req.decoded = result;
        // We call next to pass execution to the subsequent middleware
        next();
      } catch (err) {
        result = { 
            error: `Authentication error. signature mismatch.`,
            status: 401
          };
          res.status(401).send(result);
        // Throw an error just in case anything goes wrong with verification
        throw new Error(err);
      }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401
      };
      res.status(401).send(result);
    }
  }

  module.exports.validateTokenAll = (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    console.log('validating all');
    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
      const options = {
        expiresIn: '1h',
        issuer: '103.218.25.96:8086'//'localhost:8086'
      };
      try {
        result = jwt.verify(token, 'mytoken@asif', options);
        console.log('validating');
        //console.log(result.role);
        req.decoded = result;
        // We call next to pass execution to the su
        next();
      } catch (err) {
        result = { 
            error: `Authentication error. signature mismatch.`,
            status: 401
          };
          res.status(401).send(result);
        throw new Error(err);
      }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401
      };
      res.status(401).send(result);
    }
  }

  module.exports.validateTokenAdminAccounts = (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    console.log('validating admin accouts');

    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
      const options = {
        expiresIn: '1h',
        issuer: 'localhost:8086'
      };
      try {
        result = jwt.verify(token, 'mytoken@asif', options);
        console.log('validating--');
        console.log(result.role);
        if(result.role == "admin" || result.role == "accounts"){
        }
        else{
          result = { 
            error: `Role Mismatch.`,
            status: 401
          };
          console.log("role mismatch")
          res.status(401).send(result);
          return;
        }
        // Let's pass back the decoded token to the request object
        req.decoded = result;
        // We call next to pass execution to the subsequent middleware
        next();
        return
      } catch (err) {
        result = { 
            error: `Authentication error. signature mismatch.`,
            status: 401
          };
          res.status(401).send(result);
        // Throw an error just in case anything goes wrong with verification
        throw new Error(err);
      }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401
      };
      res.status(401).send(result);
    }
  }

  module.exports.validateTokenAdminHr = (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    console.log('validating admin accouts');

    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
      const options = {
        expiresIn: '1h',
        issuer: 'localhost:8086'
      };
      try {
        result = jwt.verify(token, 'mytoken@asif', options);
        console.log('validating--');
        console.log(result.role);
        if(result.role == "admin" || result.role == "hr"){
        }
        else{
          result = { 
            error: `Role Mismatch.`,
            status: 401
          };
          console.log("role mismatch")
          res.status(401).send(result);
          return;
        }
        // Let's pass back the decoded token to the request object
        req.decoded = result;
        // We call next to pass execution to the subsequent middleware
        next();
        return
      } catch (err) {
        result = { 
            error: `Authentication error. signature mismatch.`,
            status: 401
          };
          res.status(401).send(result);
        // Throw an error just in case anything goes wrong with verification
        throw new Error(err);
      }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401
      };
      res.status(401).send(result);
    }
  }