var app = require('express')();
var cors = require('cors');
//app.use(cors());
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');


app.post('/upload', function(req, res){
    console.log(req.query.picid);
    const picid = req.query.picid;
   
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
      const ext =  path.extname(file.name);
        file.path = __dirname + '/uploads/' +  picid + ext;//file.name;
    });

    form.on('file', function (name, file){
        const ext =  path.extname(file.name);
        console.log('Uploaded ' + file.name);
        return res.json({ success: true,fileid: picid + ext,full: __dirname + '/uploads/' + picid + ext,fullpdf: "/images/pdficon.png", error : ""});          
    });
    form.on('error', (err) => {
      console.log('ParsingError');
      return res.sendStatus(400);
    })
    //return res.json({ success : false, fileid : "failed", error :"something went wrong" });
           
})
app.get('/delete', function(req, res){
  console.log("inside file delete");
  const sp = __dirname + '/uploads/';
  console.log(path.join(sp,req.query.picid));

  fs.unlink(path.join(sp,req.query.picid),function(err){
    if(err) return res.status(400).send({message: 'This is an error!'}); 
    return res.json({ success : true, fileid : sp + req.query.picid, name : req.query.picid, error : "" });
  });
  //return res.json({ success : true, fileid : sp + req.query.picid, name : req.query.picid, error : "" });
})
app.get('/getpic', function(req, res){
  console.log("inside file get");
  const sp = __dirname + '/uploads/';
  console.log(path.join(sp,req.query.picid));

  return res.sendFile(path.join(sp,req.query.picid));
  //return res.json({ success : true, fileid : sp + req.query.picid, name : req.query.picid, error : "" });
})
module.exports = app;