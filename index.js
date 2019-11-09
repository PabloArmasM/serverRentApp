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
    //app.use(body_parser.urlencoded({extended:true}));
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


    app.post('/search', function(req, res){
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        var dbo = db.db("mydb");
        var myobj = JSON.parse(Object.keys(req.body)[0]);
        if("_id" in myobj){
          myobj._id = parseInt(myobj._id);
          console.log("cambiando o yo que se");
        }
        var table = myobj.tabla;
        delete myobj.tabla;
        dbo.collection(table).find(myobj).toArray(function(err, result) {
          if(err){
            res.send({type: 'danger', message:'No se pudo encontrar el dato'});
            throw err;
          }
          res.send(JSON.stringify(result));
          db.close();
        });
      });
    });


      app.post('/update', function (req, res) {
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
      });


    //Separar actualizar del guardado
    app.post('/add', function (req, res) {

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

      });

      app.post('/delete', function (req, res) {
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
      });


      /*UNIR EN UNA SENTENCIA*/
      app.post('/multa', function (req, res) {
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

          dbo.collection("contratos").findOne({ $and: [{ fechaEntrada: { $lte : fecha}} , { fechaSalida: {$gte: fecha}}, { matricula: {$eq: matricula}}] }, function(err, obj){
            if(err){
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              throw err;
            }
            console.log(result);
            if(!result){
              console.log("Hola");
              res.send({type: 'danger', message:'No se pudo encontrar el dato'});
              return;
            }

            //&& result.hasOwnProperty('clientCode')
            MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
              if(err){
                res.send({type: 'danger', message:'No se pudo encontrar el dato'});
                throw err;
              }
              var dbo = db.db("mydb");
              dbo.collection("clientes").findOne({_id: obj.clientCode}, function(err, result){
                if(err){
                  res.send({type: 'danger', message:'El cliente puede que no exista'});
                  throw err;
                }
                  res.send(result);
                  db.close();
              });
            });
            db.close();
          });
        });
      });

  app.post('/stateVehicle', function (req, res) {
    console.log("¿alguien me llama?");
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

      console.log("Fecha dentro de 3 meses");
      console.log(futuro);
      var i = 0;
      var diaInicial = date.getDate();
      var anoInicial = date.getFullYear();
      var mesInicial = date.getMonth();


      var myPromise = (fecha) => {
       return new Promise((resolve, reject) => {
          var insert = { _id: {matricula:myobj.matricula, fecha:fecha}, status:0};
          dbo.collection(tabla).insertOne(insert, function(err, insertResult){
            console.log("Uno creado");
            if(err) reject(err);
            resolve(0);

          });
       });
    };


      while(date.getTime() < futuro.getTime()){
        //await myPromise
        console.log("han pasado "+i+" días");
        date = formatMonth(new Date(anoInicial, mesInicial, diaInicial +i));
        console.log(date);
        var result = await myPromise(date.getTime());

        i++;
      }



    });
  });



  app.post('/updateState', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var myobj = JSON.parse(Object.keys(req.body)[0]);

      var table = "vehicleStatus"+myobj.grupo;
      var date = new Date(myobj.fechaSalida);
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      var futuro = new Date(myobj.fechaEntrada);
      futuro = new Date(futuro.getFullYear(), futuro.getMonth(), futuro.getDate());


      console.log("Fecha de salida");
      console.log(date);

      console.log("Fecha de entrega");
      console.log(futuro);
      var i = 0;
      var diaInicial = date.getDate();
      var anoInicial = date.getFullYear();
      var mesInicial = date.getMonth();


      var myPromise = (fecha) => {
       return new Promise((resolve, reject) => {
            var id = {_id: {matricula: myobj.matricula, fecha : fecha}};
            console.log(myobj.status);
            dbo.collection(table).find(id).toArray(function(err, result) {
              console.log(result);
            });
            dbo.collection(table).updateOne(id, {$set : {status : myobj.status}}, function(err, result) {
            //dbo.collection(table).updateOne({ $and: [{ fecha: { $eq : fecha}} , { matricula: {$eq: myobj.matricula}}]}, {$set : {status : myobj.status}}, function(err, result) {
            console.log("Uno creado");
            if(err) reject(err);
            resolve(0);

          });
       });
     };


    while(date.getTime() < futuro.getTime()){
      //await myPromise
      console.log("han pasado "+i+" días");
      date = formatMonth(new Date(anoInicial, mesInicial, diaInicial +i));
      console.log(date.getTime());
      var result = await myPromise(date.getTime());

      i++;
    }

  });

  });

  app.post('/getVehicleStatus', function(req, res){
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
      var dbo = db.db("mydb");
      var myobj = JSON.parse(Object.keys(req.body)[0]);
      var table = "vehicleStatus"+myobj.grupo;
      delete myobj.grupo;
      dbo.collection(table).find({ $and: [{ "_id.fecha": { $gte : myobj.fechaInicial}} , { "_id.fecha": {$lte: myobj.fechaFinal}}]}).toArray(function(err, result) {
        if (err) throw err;
        var send = {};

        result.forEach(element =>{ //Buscar la forma de hacer que sea la fecha : {matricula : status} <- Esta es la clave
          console.log(element);
          var tempObj = {};
          if(element._id.fecha in send)
            tempObj = send[element._id.fecha];
          tempObj[element._id.matricula] = element.status;
          send[element._id.fecha] =  tempObj;
        });
        console.log(send);
        res.send(JSON.stringify(send));
        db.close();
      });
    });
  });

/*
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  var dbo = db.db("mydb");
  console.log(req.body.data);
  var myobj = JSON.parse(req.body);
  dbo.collection("clientes").insertOne(myobj, function(err, requests) {
    if (err){
      res.send(JSON.stringify({error : "No se insertaron"}));
      throw err;
    }
    res.send(JSON.stringify({success : "Información guradada"}));
    console.log("1 document inserted");
    db.close();
  });
});
*/



    // use it before all route definitions

    /*app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });*/

    app.listen(3000, () => {
      console.log("El servidor está inicializado en el puerto 3000");
    });

    function formatMonth(date){

      var month = ("0" + ((date.getMonth()) + 1)).slice(-2);
      var day = ("0" + ((date.getDate()))).slice(-2);

      return(new Date(date.getFullYear()+"-"+month+"-"+day));


    }

function updateState(){
  var actual = new Date();
  console.log(actual);
  console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()+4, 1)));
  console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()+4, 0)));
  console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()-4, 1)));
  console.log(formatMonth(new Date(actual.getFullYear(), actual.getMonth()-4, 0)));
  console.log("NEWWWW");


}


  /*var CronJob = require('cron').CronJob;
  //segundo minut hora dia mes año y dia de la semana
  new CronJob('* * * * * *', function() {
  //new CronJob('0 0 0 1 * *', function() {
    updateState();
  }, null, true, 'Atlantic/Canary');*/
