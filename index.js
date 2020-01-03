const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose');
    var MongoClient = require('mongodb').MongoClient;


    var url = "mongodb://localhost:27017/cacas";

    var flagDevuelve = true;

    const app = express();
    let port = process.env.PORT || 3000;

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.get('/', function (req, res) {
      res.send('Saludos desde express');
    });


    function getNextSequence(db, name, callback) {
        db.collection("counters").findOneAndUpdate( { _id: name }, { $inc: { seq: 1 } }, function(err, result){
            if(err) callback(err, result);
            callback(err, result.value.seq);
        } );
    }

    function getDecSeq(name) {
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        var dbo = db.db("mydb");
        dbo.collection("counters").findOneAndUpdate( { _id: name }, { $inc: { seq: -1 } }, function(err, result){
        } );
        db.close();
      });
    }

    app.post('/createOrUpdate/', function(req, res){
      try{
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = JSON.parse(Object.keys(req.body)[0]);
          var table = myobj.tabla;
          var id = myobj._id;
          delete myobj.tabla;
          dbo.collection(table).find({_id : id}).toArray(function(err, result) {
            if(err){
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              throw err;
            }

            if(result.length > 0){
              console.log("Actualizando");
              var query = {_id : myobj._id};
              delete myobj._id;
              dbo.collection(table).updateOne(query, {$set : myobj}, function(err, result) {
                if(err) throw err;
                db.close();
                res.send(JSON.stringify({_id: result, message : {type: 'success', message:'Se creo el elemento satisfactoriamente'}}));
              });
            }else{
              console.log("Insertando");
              console.log(myobj);
                dbo.collection(table).insertOne(myobj, function(err, insertResult){
                  if (err){
                    getDecSeq(table+"_id");
                    console.log("pasa algo raro");
                    res.send({type: 'danger', message:'No se pudo crear el elemento'});
                  }else{
                    console.log(insertResult.ops[0]._id);
                    res.send(JSON.stringify({_id: insertResult.ops[0], message : {type: 'success', message:'Se creo el elemento satisfactoriamente'}}));
                  }
                db.close();
              });
            }
            //res.send(JSON.stringify(result));
            db.close();
          });

          });
        }catch(err){
          console.log(err);
        }
    });

    app.post('/search', function(req, res){
      try{
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
          var dbo = db.db("mydb");
          var myobj = JSON.parse(Object.keys(req.body)[0]);
          console.log("En la llegada");
          console.log(myobj);
          if("_id" in myobj){
            myobj._id = parseInt(myobj._id);
            console.log("cambiando o yo que se");
          }

          var table = myobj.tabla;
          delete myobj.tabla;
          console.log("Antes");
          console.log(myobj);
          console.log("A VER SI ES AQUI");
          if("query" in myobj){
            myobj = myobj.query;
          }
          console.log(myobj);
          dbo.collection(table).find(myobj).toArray(function(err, result) {
            if(err){
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              throw err;
            }
            res.send(JSON.stringify(result));
            db.close();
          });
        });
      }catch(err){
        console.log(err);
      }
    });



    app.post('/searchString', function(req, res){
      try{
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
          var dbo = db.db("mydb");
          var myobj = JSON.parse(Object.keys(req.body)[0]);
          console.log("En la llegada");
          console.log(myobj);

          var table = myobj.tabla;
          delete myobj.tabla;
          console.log("Antes");
          console.log(myobj);
          console.log("A VER SI ES AQUI");
          if("query" in myobj){
            myobj = myobj.query;
          }
          console.log(myobj);
          dbo.collection(table).find(myobj).toArray(function(err, result) {
            if(err){
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              throw err;
            }
            res.send(JSON.stringify(result));
            db.close();
          });
        });
      }catch(err){
        console.log(err);
      }
    });


    app.post('/updateOP', function (req, res) {
      try{
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = JSON.parse(Object.keys(req.body)[0]);
          var table = myobj.tabla;
          delete myobj.tabla;

          var query = {_id : parseInt(myobj._id)};
          dbo.collection(table).find(query , {$exists: true}).toArray(function(err, result){
            if(result){
              delete myobj._id;
              console.log(myobj);
              dbo.collection(table).updateOne(query, {$set : myobj}, function(err, result) {
                if(err) throw err;
                db.close();
                res.send(JSON.stringify({_id: result, message : {type: 'success', message:'Se creo el elemento satisfactoriamente'}}));
              });
            }else{
              res.send({type: 'danger', message:'No se pudo actualizar'});
            }
          });

        });
      }catch(err){
        console.log(err);
      }
    });


      app.post('/update', function (req, res) {
        try
        {
          MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = JSON.parse(Object.keys(req.body)[0]);
          var table = myobj.tabla;
          delete myobj.tabla;
          var query = {_id : myobj._id};
          dbo.collection(table).find(query , {$exists: true}).toArray(function(err, result){
            if(result){
              delete myobj._id;
              dbo.collection(table).updateOne(query, {$set : myobj}, function(err, result) {
                if(err) throw err;
                db.close();
                res.send(JSON.stringify({_id: result, message : {type: 'success', message:'Se creo el elemento satisfactoriamente'}}));
              });
            }else{
              res.send({type: 'danger', message:'No se pudo actualizar'});
            }
          });

        });
      }catch(err){
        console.log(err);
      }
    });


      app.post('/addOP', function (req, res) {
        try{
          MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myobj = JSON.parse(Object.keys(req.body)[0]);
            var table = myobj.tabla;
            delete myobj.tabla;
            dbo.collection(table).insertOne(myobj, function(err, result){
              if (err){
                res.send({type: 'danger', message:'No se pudo crear el elemento'});
              }else{
                res.send(JSON.stringify({message : {type: 'success', message:'Se creo el elemento satisfactoriamente'}}));
              }
            });
            db.close();
          });
        }catch(err){
          console.log(err);
        }
    });


    //Separar actualizar del guardado
    app.post('/add', function (req, res) {
      try{
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = JSON.parse(Object.keys(req.body)[0]);
          var table = myobj.tabla;
          delete myobj.tabla;
          getNextSequence(dbo, table+"_id", function(err, result){
              if(!err){
                  myobj._id = result;
                  dbo.collection(table).insertOne(myobj, function(err, insertResult){
                    if (err){
                      getDecSeq(table+"_id");
                      res.send({type: 'danger', message:'No se pudo crear el elemento'});
                    }else{
                      res.send(JSON.stringify({_id: result, message : {type: 'success', message:'Se creo el elemento satisfactoriamente'}}));
                    }
                  });
                  db.close();
              }
            });
          });
        }catch(err){
          console.log(err);
        }

      });

      app.post('/delete', function (req, res) {
        try{
          MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
            if (err){
              res.send({type: 'danger', message:'No se ha podido eliminar el elemento'});
              throw err;
            }
            var dbo = db.db("mydb");
            var myobj = JSON.parse(Object.keys(req.body)[0]);
            var table = myobj.tabla;
            delete myobj.tabla;
            dbo.collection(table).deleteOne(myobj, function(err, obj){
              if(err){
                res.send({type: 'danger', message:'No se pudo eliminar el elemento'});
                 throw err;
              }
              res.send({type: 'success', message:'El elemento se ha eliminado satisfactoriamente'});
              db.close();
            });
          });
        }catch(err){
          console.log(err);
        }
      });


      /*UNIR EN UNA SENTENCIA*/
      app.post('/multa', function (req, res) {
        try{
          MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
            if (err){
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              throw err;
            }
            var dbo = db.db("mydb");
            var myobj = JSON.parse(Object.keys(req.body)[0]);
            var fecha = myobj.fecha;
            var matricula = myobj.matricula;
            var result;

            dbo.collection("contratos").findOne({ $and: [{ fechaEntrada: { $gte : fecha}} , { fechaSalida: {$lte: fecha}}, { matricula: {$eq: matricula}}] }, function(err, obj){
              if(err){
                res.send({type: 'danger', message:'No se pudo encontrar el dato'});
                throw err;
              }
              if(!obj){
                res.send({type: 'danger', message:'No se pudo encontrar el dato'});
                return;
              }
              res.send(obj);
              db.close();
            });
          });
        }catch(err){
          console.log(err);
        }
      });


      app.post('/dayRange', function (req, res) {
        try{
          MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
            if (err){
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              throw err;
            }
            var dbo = db.db("mydb");
            var myobj = JSON.parse(Object.keys(req.body)[0]);
            var fechaSalida = myobj.fechaSalida;
            var fecha = myobj.fecha;
            var result;
            dbo.collection("contratos").find({ $and: [{ fechaSalida: { $lte : fecha}} , { fechaSalida: {$gte: fechaSalida}}] }).toArray(function(err, result) {
              if(err){
                res.send({type: 'danger', message:'No se pudo encontrar el dato'});
                throw err;
              }
              if(!result){
                console.log(result);
                res.send({type: 'danger', message:'No se obtuvo ningun resultado'});
                return;
              }
              console.log(result);
              res.send(JSON.stringify(result));
              db.close();
            });
          });
        }catch(err){
          console.log(err);
        }
      });

  app.post('/stateVehicle', function (req, res) {
    try{
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
        if (err) {
            res.send({type: 'danger', message:'No se ha podido almacenar el estado de los vehículos'});
            throw err;
          }
        var dbo = db.db("mydb");
        var myobj = JSON.parse(Object.keys(req.body)[0]);

        var tabla = "vehicleStatus"+myobj.grupo;
        var date = new Date(myobj.fecha);
        var fechaActual = new Date();

        if(date.getTime() < fechaActual.getTime())
          date = fechaActual;

        var futuro = formatMonth(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 4, 0));

        var i = 0;
        var diaInicial = date.getDate();
        var anoInicial = date.getFullYear();
        var mesInicial = date.getMonth();


        var myPromise = (fecha) => {
         return new Promise((resolve, reject) => {
            var insert = { _id: {matricula:myobj.matricula, fecha:fecha}, status:0};
            dbo.collection(tabla).insertOne(insert, function(err, insertResult){
              if(err) reject(err);
              resolve(0);

            });
         });
    };


      while(date.getTime() < futuro.getTime()){
        //await myPromise
        date = formatMonth(new Date(anoInicial, mesInicial, diaInicial +i));
        var result = await myPromise(date.getTime());

        i++;
      }



    });
  }catch(err){
    console.log(err);
  }
  });



  app.post('/updateState', function (req, res) {
    try{
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = JSON.parse(Object.keys(req.body)[0]);

        var table = "vehicleStatus"+myobj.grupo;
        var date = new Date(myobj.fechaSalida);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var futuro = new Date(myobj.fechaEntrada);
        futuro = new Date(futuro.getFullYear(), futuro.getMonth(), futuro.getDate());

        var i = 0;
        var diaInicial = date.getDate();
        var anoInicial = date.getFullYear();
        var mesInicial = date.getMonth();


        var myPromise = (fecha) => {
         return new Promise((resolve, reject) => {
              var id = {_id: {matricula: myobj.matricula, fecha : fecha}};
              dbo.collection(table).find(id).toArray(function(err, result) {
              });
              dbo.collection(table).updateOne(id, {$set : {status : myobj.status}}, function(err, result) {
              //dbo.collection(table).updateOne({ $and: [{ fecha: { $eq : fecha}} , { matricula: {$eq: myobj.matricula}}]}, {$set : {status : myobj.status}}, function(err, result) {
              if(err) reject(err);
              resolve(0);

            });
         });
       };


      while(date.getTime() < futuro.getTime()){
        //await myPromise
        date = formatMonth(new Date(anoInicial, mesInicial, diaInicial +i));
        var result = await myPromise(date.getTime());

        i++;
      }

    });
  }catch(err){
    console.log(err);
  }

  });

  app.post('/getVehicleStatus', function(req, res){
    try{
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        var dbo = db.db("mydb");
        var myobj = JSON.parse(Object.keys(req.body)[0]);
        var table = "vehicleStatus"+myobj.grupo;
        delete myobj.grupo;
        dbo.collection(table).find({ $and: [{ "_id.fecha": { $gte : myobj.fechaInicial}} , { "_id.fecha": {$lte: myobj.fechaFinal}}]}).toArray(function(err, result) {
          if (err) throw err;
          var send = {};

          result.forEach(element =>{ //Buscar la forma de hacer que sea la fecha : {matricula : status} <- Esta es la clave
            var tempObj = {};
            if(element._id.fecha in send)
              tempObj = send[element._id.fecha];
            tempObj[element._id.matricula] = element.status;
            send[element._id.fecha] =  tempObj;
          });
          res.send(JSON.stringify(send));
          db.close();
        });
      });
    }catch(err){
      console.log(err);
    }
  });

    app.listen(3000, () => {
      console.log("El servidor está inicializado en el puerto 3000");
    });

    function formatMonth(date){

      var month = ("0" + ((date.getMonth()) + 1)).slice(-2);
      var day = ("0" + ((date.getDate()))).slice(-2);

      return(new Date(date.getFullYear()+"-"+month+"-"+day));


    }



 function updateCronState(element){
   try{
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");

      var tabla = "vehicleStatus"+element.grupo;
      var fechaActual = new Date();


      var date =  formatMonth(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 3, 1));
      var futuro = formatMonth(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 4, 0));


      var diaInicial = date.getDate();
      var anoInicial = date.getFullYear();
      var mesInicial = date.getMonth();

      var myPromise = (fecha) => {
       return new Promise((resolve, reject) => {
          var insert = { _id: {matricula:element.matricula, fecha:fecha}, status:0};
          dbo.collection(tabla).insertOne(insert, function(err, insertResult){
            if(err) reject(err);
            resolve(0);
          });
        });
      }
      var i = 0;
       while(date.getTime() < futuro.getTime()){
         //await myPromise
         date = formatMonth(new Date(anoInicial, mesInicial, diaInicial +i));
         try{
           var result = await myPromise(date.getTime());
         }catch(err){
           console.log(err);
         }

         i++;
       }

       var pasado =  formatMonth(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 3, 0));
       var date = formatMonth(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 4, 1));

       /*dbo.collection(table).deleteOne(myobj, function(err, obj){
         if(err){
           res.send({type: 'danger', message:'No se pudo eliminar el elemento'});
            throw err;
         }*/

         var diaInicial = date.getDate();
         var anoInicial = date.getFullYear();
         var mesInicial = date.getMonth();

         var myPromise = (fecha) => {
          return new Promise((resolve, reject) => {
             var insert = { _id: {matricula:element.matricula, fecha:fecha}, status:0};
             dbo.collection(tabla).deleteOne(insert, function(err, insertResult){
               if(err) reject(err);
               resolve(0);
             });
           });
         }
         var i = 0;
          while(date.getTime() < pasado.getTime()){
            //await myPromise
            date = formatMonth(new Date(anoInicial, mesInicial, diaInicial +i));
            try{
              var result = await myPromise(date.getTime());
            }catch(err){
              console.log(err);
            }

            i++;
          }


       });

     }catch(err){
       console.log(err);
     }

}


function updateState(){
  try{
    var actual = new Date();
    /*console.log(actual);
    console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()+4, 1)));
    console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()+4, 0)));
    console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()-4, 1)));
    console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()-4, 0)));
    console.log("NEWWWW");*/

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        var dbo = db.db("mydb");
        dbo.collection("vehiculos").find().toArray(function(err, result) {
            result.forEach(element => {
              updateCronState(element);
            })
        });
        db.close();
    });
  }catch(err){
    console.log(err);
  }
}


  var CronJob = require('cron').CronJob;
  //segundo minut hora dia mes año y dia de la semana
  //new CronJob('* * * * * *', function() {
  new CronJob('0 0 10 1 * *', function() {
    updateState();
  }, null, true, 'Atlantic/Canary');
