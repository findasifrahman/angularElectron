var app = require('express')();
//var validatetoken = require('./login').validateTokenAdmin;
var moment = require('moment')
var cors = require('cors');
var path = require('path');
app.use(cors());


var model = require('../models/eventmodels');
var related_model = require('../models/synonymmodels')

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var moment = require('moment');

app.get("/",function(req,res,next){
    model.findAll().then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.post('/', function(req, res,next){
    console.log("inside add");
    console.log(req.body);
    req.body.uploadDate = moment().format('YYYY-MM-DD')
    //req.body.category = parseInt(moment(req.body.date).format('YYYY'))
    let {eventname,title,subtitle,date,datetext,place,uploadDate,priority,uuid,keyword,view,relatedWord,text,numOfImage,
        numOfVideo,category, image1,image2,image3, image4,image5,image6,image7,image8,image9,image10,
        image11,image12,image13,image14,image15,image1caption,image2caption,image3caption,image4caption,image5caption,image6caption,
        image7caption,image8caption,image9caption,image10caption,image11caption,image12caption,
        image13caption,image14caption,image15caption,video,eventCNS,tenureCNS,language,
        image1prio,image2prio,image3prio,image4prio,image5prio,image6prio,image7prio,image8prio
        ,image9prio,image10prio,image11prio,image12prio } = req.body;
    model.create({
        eventname,title,subtitle,date,datetext,place,uploadDate,priority,uuid,keyword,view,relatedWord,text,numOfImage,
        numOfVideo,category,image1,image2,image3, image4,image5,image6,image7,image8,image9,image10,
        image11,image12,image13,image14,image15,image1caption,image2caption,image3caption,image4caption,image5caption,image6caption,
        image7caption,image8caption,image9caption,image10caption,image11caption,image12caption,
        image13caption,image14caption,image15caption,video,eventCNS,tenureCNS,language,
        image1prio,image2prio,image3prio,image4prio,image5prio,image6prio,image7prio,image8prio
        ,image9prio,image10prio,image11prio,image12prio
    
    }).then(result => {
        if(req.body.image1){
            fs.copyFile('api/tmpUploads/' + req.body.image1, "api/uploads/" + req.body.image1, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image2){
            fs.copyFile('api/tmpUploads/' + req.body.image2, "api/uploads/" + req.body.image2, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image3){
            fs.copyFile('api/tmpUploads/' + req.body.image3, "api/uploads/" + req.body.image3, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image4){
            fs.copyFile('api/tmpUploads/' + req.body.image4, "api/uploads/" + req.body.image4, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image5){
            fs.copyFile('api/tmpUploads/' + req.body.image5, "api/uploads/" + req.body.image5, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image6){
            fs.copyFile('api/tmpUploads/' + req.body.image6, "api/uploads/" + req.body.image6, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image7){
            fs.copyFile('api/tmpUploads/' + req.body.image7, "api/uploads/" + req.body.image7, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image8){
            fs.copyFile('api/tmpUploads/' + req.body.image8, "api/uploads/" + req.body.image8, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image9){
            fs.copyFile('api/tmpUploads/' + req.body.image9, "api/uploads/" + req.body.image9, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image10){
            fs.copyFile('api/tmpUploads/' + req.body.image10, "api/uploads/" + req.body.image10, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image11){
            fs.copyFile('api/tmpUploads/' + req.body.image11, "api/uploads/" + req.body.image11, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.image12){
            fs.copyFile('api/tmpUploads/' + req.body.image12, "api/uploads/" + req.body.image12, (err) => {
                if (err) console.log(err);
                console.log('image1 was copied to destination.txt');
            })
        }
        if(req.body.video){
            fs.copyFile('api/tmpUploads/' + req.body.video, "api/uploads/" + req.body.video, (err) => {
                if (err) console.log(err);
                console.log('video was copied to destination.txt');
            })
        }
        res.status(200).send(result)
      
    })
    .catch(err => {res.status(400).send(err);console.log(err);});
})
app.put('/', function(req, res,next){
    console.log("inside update");
    console.log(req.body.Id);
    console.log(req.body);
    //req.body.category = parseInt(moment(req.body.date).format('YYYY'))
    let { id,eventname,title,subtitle,date,datetext,place,uploadDate,priority,uuid,keyword,view,relatedWord,text,numOfImage,
        numOfVideo,category, image1,image2,image3, image4,image5,image6,image7,image8,image9,image10,image11,
        image12,image13,image14,image15,image1caption,image2caption,image3caption,image4caption,image5caption,image6caption,
        image7caption,image8caption,image9caption,image10caption,image11caption,image12caption,
        image13caption,image14caption,image15caption,video,eventCNS,tenureCNS,language,
        image1prio,image2prio,image3prio,image4prio,image5prio,image6prio,image7prio,image8prio
        ,image9prio,image10prio,image11prio,image12prio } = req.body;
      // Insert into table
    model.update({
        eventname,title,subtitle,date,datetext,place,uploadDate,priority,uuid,keyword,view,relatedWord,text,numOfImage,
        numOfVideo,category, image1,image2,image3, image4,image5,image6,image7,image8,image9,image10,image11,image12,image13,
        image14,image15,image1caption,image2caption,image3caption,image4caption,image5caption,image6caption,
        image7caption,image8caption,image9caption,image10caption,image11caption,image12caption,
        image13caption,image14caption,image15caption,video,eventCNS,tenureCNS,language,
        image1prio,image2prio,image3prio,image4prio,image5prio,image6prio,image7prio,image8prio
        ,image9prio,image10prio,image11prio,image12prio
      },{ where: { id: req.body.Id } })
        .then(result => {
            if(req.body.image1){
                fs.copyFile('api/tmpUploads/' + req.body.image1, "api/uploads/" + req.body.image1, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image2){
                fs.copyFile('api/tmpUploads/' + req.body.image2, "api/uploads/" + req.body.image2, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image3){
                fs.copyFile('api/tmpUploads/' + req.body.image3, "api/uploads/" + req.body.image3, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image4){
                fs.copyFile('api/tmpUploads/' + req.body.image4, "api/uploads/" + req.body.image4, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image5){
                fs.copyFile('api/tmpUploads/' + req.body.image5, "api/uploads/" + req.body.image5, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image6){
                fs.copyFile('api/tmpUploads/' + req.body.image6, "api/uploads/" + req.body.image6, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image7){
                fs.copyFile('api/tmpUploads/' + req.body.image7, "api/uploads/" + req.body.image7, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image8){
                fs.copyFile('api/tmpUploads/' + req.body.image8, "api/uploads/" + req.body.image8, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image9){
                fs.copyFile('api/tmpUploads/' + req.body.image9, "api/uploads/" + req.body.image9, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image10){
                fs.copyFile('api/tmpUploads/' + req.body.image10, "api/uploads/" + req.body.image10, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image11){
                fs.copyFile('api/tmpUploads/' + req.body.image11, "api/uploads/" + req.body.image11, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.image12){
                fs.copyFile('api/tmpUploads/' + req.body.image12, "api/uploads/" + req.body.image12, (err) => {
                    if (err) console.log(err);
                    console.log('image1 was copied to destination.txt');
                })
            }
            if(req.body.video){
                fs.copyFile('api/tmpUploads/' + req.body.video, "api/uploads/" + req.body.video, (err) => {
                    if (err) console.log(err);
                    console.log('video was copied to destination.txt');
                })
            }
            res.status(200).send(result)
        })
        .catch(err => {res.status(400).send(err);console.log(err)});
})
app.delete('/', (req, res,next) => {
    console.log("inside delete");

 
    console.log(req.query.id);
    model.findOne({
        where: {
           id: req.query.id
        }
     }).then(result => {
         let result11 = result.toJSON()
         console.log("reeee-",result11)
         if(result11.image1){delfile(result11.image1)}
         if(result11.image2){delfile(result11.image2)}
         if(result11.image3){delfile(result11.image3)}
         if(result11.image4){delfile(result11.image4)}
         if(result11.image5){delfile(result11.image5)}
         if(result11.image6){delfile(result11.image6)}
         if(result11.image7){delfile(result11.image7)}
         if(result11.image8){delfile(result11.image8)}
         if(result11.image9){delfile(result11.image9)}
         if(result11.image10){delfile(result11.image10)}
         if(result11.image11){delfile(result11.image11)}
         if(result11.image12){delfile(result11.image12)}
         if(result11.video){delfile(result11.video)}
         ///////////////////////////
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
         /////////////////////////////
       }).catch(err  => {res.status(400).send(err);console.log(err)});   


});
var fs = require('fs');
function delfile(filename){
   ///////////////////////////////////////////////

   var filePath;// = __dirname + '/uploads/' + "autosol.jpg"//'c:/book/discovery.docx'; 
   const sp = __dirname + '\\uploads\\';
   filePath = path.join(sp,filename)
   console.log("filepath--", filePath)
   fs.unlink(filePath, function(err) {
       if(err && err.code == 'ENOENT') {
           // file doens't exist
           console.info("File doesn't exist, won't remove it.");
       } else if (err) {
           // other errors, e.g. maybe we don't have enough permission
           console.error("Error occurred while trying to remove file");
       } else {
           console.info(`removed-- ` + filename);
       }
   });
///////////////////////////////////////////////////////
}

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
app.get("/getbyyear",function(req,res,next){
    console.log(req.query.myear);
    var st = moment({year:req.query.myear}).format("YYYY-MM-DD")
    var endDate = moment(st).endOf('year').format("YYYY-MM-DD");
    console.log("st-", st)
    console.log("end-",endDate)
    model.findAll({
        where: {
            date: {
                [Op.between]: [st, endDate]
            }
        }, order:  [['date', 'DESC']]
     }).then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})
app.get("/getbydate",function(req,res,next){
    console.log(req.query.mdate);
    var st = moment(req.query.mdate).format("YYYY-MM-DD")
    //var endDate = moment(st).endOf('year').format("YYYY-MM-DD");
    console.log("st-", st)
    //console.log("end-",endDate)
    model.findAll().then(result2 =>{
        let relate_res = []
        result2.map((mapval,index) =>{
            if(moment(mapval.date).format("MM-DD") == moment(req.query.mdate).format("MM-DD")){
                relate_res.push(mapval)
            }
            if(index == result2.length -1 ){
                let final_related =  relate_res.sort(function(a, b){return moment(b.date) - moment(a.date)});
               console.log(final_related)
               res.json(final_related)
            }
        })
    }).catch(err  => {res.status(400).send(err);console.log(err)});  
})

app.get("/getbymenusearch",function(req,res,next){
    console.log(req.query.menuval);

    model.findAll({
        where: {
            category:req.query.menuval
        }, order:  [['date', 'DESC']], limit:40
     }).then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   
})


app.get("/getbyidrelated",function(req,res,next){
    console.log(req.query.id);
    model.findOne({
        where: {
           id: req.query.id
        }
     }).then(result => {
         let mdate =  result.date
         let sarch_title = result.title
         let search_place = result.place
         model.findAll().then(result2 =>{
            let relate_res = []
            let related_year = []
            let related_news = []
             result2.map((mapval,index) =>{
                if(req.query.id !== mapval.id.toString()){
                    if(moment(mapval.date).format("MM-DD") == moment(mdate).format("MM-DD")){
                        if(relate_res.length < 11)
                            relate_res.push(mapval)
                    }
                    if(moment(mapval.date).isSame(mdate,'year')){
                        if(related_year.length < 11)
                            related_year.push(mapval)
                    }
                    if(mapval.title.includes(sarch_title) || sarch_title.includes(mapval.title) 
                        || mapval.place.includes(sarch_title) || sarch_title.includes(mapval.place)){
                            
                        related_news.push(mapval)
                    }
                    else if(search_place){
                        if(mapval.place.includes(search_place) || search_place.includes(mapval.place)){
                            related_news.push(mapval)
                        }
                    }
                 }
                 if(index == result2.length -1 ){
                     let final_related =  related_news.sort(function(a, b){return moment(b.date) - moment(a.date)});
                    
                    res.json({idres:result, relateddate: relate_res, relatedyear: related_year,
                        relatednews: final_related.splice(0,5)})
                 }
             })

         })
    
    }).catch(err  => {res.status(400).send(err);console.log(err)});   
})

app.get("/getallbysearch",function(req,res,next){
    console.log("req.query.id..",req.query.id);
    let sarch_title = req.query.id
         model.findAll().then(result2 =>{
            let relate_res = []

            related_model.findAll().then(relatedword =>{
                //console.log("relll wert-",relatedword)
                    //////////////////////////
                    
                    let rel_res = relatedword.find(x=> sarch_title.toLowerCase().includes(x.related.toLowerCase()) 
                    || sarch_title.toLowerCase().includes(x.word.toLowerCase()) )
                    /*if(relatedword.related){
                        rel_res = relatedword.related.split(',');
                        relatedword.find(x=> sarch_title.toLowerCase().includes(x.related.toLowerCase()) 
                            || sarch_title.toLowerCase().includes(x.word.toLowerCase()) )
                        //rel_res.push(x.word)
                    }*/
                    result2.map((mapval,index) =>{
                            var keyword_arr;
                            if(mapval.keyword){
                                keyword_arr  = mapval.keyword.split(',');
                            }
                           
                            console.log("relll res--", rel_res)
                            if(mapval.title.toLowerCase().includes(sarch_title.toLowerCase()) || sarch_title.toLowerCase().includes(mapval.title.toLowerCase())){                        
                                mapval.priority = 10
                                relate_res.push(mapval)
                            }else if(sarch_title.toLowerCase().includes(mapval.title.toLowerCase())){                        
                                mapval.priority = 6
                                relate_res.push(mapval)
                            }else if(mapval.place.toLowerCase().includes(sarch_title.toLowerCase()) || sarch_title.toLowerCase().includes(mapval.place.toLowerCase())){
                                mapval.priority = 9
                                relate_res.push(mapval)
                            }
                            else if(mapval.place.toLowerCase().includes(sarch_title.toLowerCase()) || sarch_title.toLowerCase().includes(mapval.place.toLowerCase())){
                                mapval.priority = 8
                                relate_res.push(mapval)             
                            }else if(rel_res ){
                                if(mapval.title.toLowerCase().includes(rel_res.word.toLowerCase()) || 
                                        mapval.title.toLowerCase().includes(rel_res.related.toLowerCase())){                        
                                    mapval.priority = 10
                                    relate_res.push(mapval)
                                }                               
                            }else if(keyword_arr){
                                if(keyword_arr.find(x=> sarch_title.toLowerCase().includes(x.toLowerCase())  )){
                                    mapval.priority = 7
                                    relate_res.push(mapval)
                                }
                            }
                        
                            if(index == result2.length -1 ){
                                var final_related =  relate_res.sort(function(a, b){return moment(b.date) - moment(a.date)});
                                console.log("final_related--", final_related)
                                res.json(final_related)
                            }
                    })

            })
            //////////
         }).catch(err  => {res.status(400).send(err);console.log(err)});   
})

app.get("/getrecent",function(req,res,next){
    model.findAll({
        limit: 10, order:  [['date', 'DESC']]
     }).then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});   

})
app.get("/getrandom",function(req,res,next){

    model.findAll({    where:{ 
        [Op.or]:[
            {image1prio: true},
            {image2prio: true},
            {image3prio: true},
            {image4prio: true},
            {image5prio: true},
        ]
        
    },order: Sequelize.literal('random()'), limit: 10 }).then((result) => {
        res.json(result)
        // single random encounter
    });
})
app.get("/getnextarticle",function(req,res){
    var st = moment(req.query.mdate).format("YYYY-MM-DD")
    console.log("next art date--", st)

    /*model.findAll({
        where:{  
            id: {
                [Op.gt]: parseInt(req.query.mdate)
            }
        }, limit: 1,order:  [['id', 'ASC']]
     }).then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});*/
    model.findAll({
        where:{  
            date: {
                [Op.gt]: st
            }
        },limit: 1,order:  [['date', 'ASC']]
     }).then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});
})
app.get("/getprevarticle",function(req,res){
    var st = moment(req.query.mdate).format("YYYY-MM-DD")
    console.log("next art date--", st)
   /* model.findAll({
        where:{  
            id: {
                [Op.lt]: parseInt(req.query.mdate)
            }
        }, limit: 1,order:  [['id', 'DESC']]
     }).then(result => {
           res.json(result)
           console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});*/
       model.findAll({
        where:{  
            date: {
                [Op.lt]: st
            }
        },limit: 1,order:  [['date', 'DESC']]
     }).then(result => {
           res.json(result)
           //console.log(result)
       }).catch(err  => {res.status(400).send(err);console.log(err)});
})
app.put("/updateprio",function(req,res,next){
    console.log("inside update prio--",req.body.imageno,  req.body.prioval)
    if(req.body.imageno == "1"){
        model.update({
            image1prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
    else if(req.body.imageno == "2"){
        model.update({
            image2prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
    else if(req.body.imageno == "3"){
        model.update({
            image3prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
    else if(req.body.imageno == "4"){
        model.update({
            image4prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
    else if(req.body.imageno == "5"){
        model.update({
            image5prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
    else if(req.body.imageno == "6"){
        model.update({
            image6prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
    else if(req.body.imageno == "7"){
        model.update({
            image7prio: req.body.prioval
        },{ where: { id: req.body.Id } })
            .then(result => res.status(200).send(result), console.log(" update successfull"))
            .catch(err => {res.status(400).send(err);console.log(err)});
    }
})

module.exports = app;