const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Evento = mongoose.model('eventi');
const utente = mongoose.model('utenti');
const {ensureAuthenticated} = require('../helpers/auth');
const path = require('path');
//const multer = require('multer');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
const keys = require('../config/keys.js');
//const geocoder = require('../utils/geocoder');
//const keys = require('../config/keys.js');
const NodeGeocoder = require('node-geocoder');
 

 







// Show Single event
router.get('/show/:id', (req, res) => {
  Evento.findOne({
    _id: req.params.id
    })
    .populate('creatore')     //to access creator info
    .then(evento => {
      res.render('eventi/show', {
        evento:evento
      });
    });
});



// route ricerca annunci
router.post('/ricerca', ensureAuthenticated, (req,res) => {
  //trova gli annunci creati dall'utente
    console.log(req.user);
    console.log(req.body.titolo);
    //console.log(req.body.descrizione);
    console.log(req.body.indirizzo);
    console.log(req.body.categoria);
    //console.log(req.user.annunci);
    
    
   Evento.find({$and :[{citta: req.body.citta },{categoria: req.body.categoria},{venditore:{ $ne: req.user}}]})
    .populate('eventi')
    .then(eventi_trovati => {
      console.log("eventi cercati");
      res.render('eventi/eventi_trovati', {
        eventi_trovati: eventi_trovati
      });
    })
});





// eventi route
router.get('/mieiEventi', ensureAuthenticated, (req,res) => {
  //trova gli annunci creati dall'utente

   Evento.find({
    creatore: req.user.id
    })
    .then(mieieventi => {

      utente.findOne({
        _id:req.user.id
      })
      .populate('eventi')
      .then(utentetrovato => {
        res.render('eventi/mieiEventi', {
          mieieventi:mieieventi,
          eventsjoined: utentetrovato.eventi
        });
      })
    })
});


// Crea evento route
router.get('/crea_Evento',ensureAuthenticated,(req,res) => {
  res.render('eventi/crea_Evento');
})


//rindirizzo alla form di edit dell'annuncio

router.get('/modifica_Evento/:id', ensureAuthenticated, (req,res) => {
  Evento.findOne({
    _id: req.params.id
    })
    .then(evento => {
      res.render('eventi/modifica_Evento', {
        evento: evento
      });
    });
})


//upload
// aggiunta di un annuncio
router.post('/crea_Evento',(req,res) => {
  
  
  let errors = [];

  //console.log(req.body.file);
  //server side validation
  if(!req.body.categoria){
    errors.push({text:'scegli una categoria '});
  }
  if(!req.body.titolo){
    errors.push({text:'scegli un titolo'});
  }
  console.log(errors);
  if(errors.length > 0){
    res.render('eventi/crea_Evento', {
      errors: errors,
      categoria: req.body.categoria,
      titolo: req.body.titolo,
      descrizione: req.body.descrizione,
    });
  } else{


    
    /*var imageFile = req.file.filename;
    console.log(req.file.path);
    console.log(imageFile);
    //console.log(req.file);
    //var success = req.file.filename+ "caricato correttamente";
    //var image = fs.readFileSync(req.file.path);
    //console.log(image);
    //var type = 'image/png';
    //crea l'oggetto annuncio
    */
   /*
const options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: 'Mbr9QG9PWZm1a256AGHD5NY4f5Gv0XVx',
  formatter: null

};

const  geocoder = NodeGeocoder(options);
const res =  geocoder.geocode('29 champs elysée paris');
 console.log(res);


*/





    //console.log(req.body.indirizzo.toString());
    //const loc =  geocoder.geocode('29 champs elysée paris');
    //console.log(loc);

    const nuovoEvento = new Evento();
    /*nuovoEvento.luogo = {
      type: 'Point',
      coordinate : [loc[0].longitude, loc[0].latitude],
      indirizzo_formattato: loc[0].formattedAddress
    }
    */
    nuovoEvento.categoria= req.body.categoria;
    nuovoEvento.titolo =  req.body.titolo;
    nuovoEvento.descrizione =  req.body.descrizione;
    nuovoEvento.data =  req.body.data + ' ' + req.body.time;
    nuovoEvento.creatore = req.user.id;
    nuovoEvento.immagine = req.body.immagine;
    nuovoEvento.indirizzo = req.body.indirizzo;
    var stringa = req.body.indirizzo;
    var n = stringa.indexOf(",");
    var result = stringa.substring(n+1);
    nuovoEvento.citta = result;

    
    
    nuovoEvento.save().then(evento => {
        console.log("evento creato");
        req.user.save();
        res.redirect('/eventi/mieiEventi');
      })
      console.log("sono qui");
          // Send a notify to all users
      amqp.connect(keys.ampqURI,function(err,conn){
        conn.createChannel(function(err, ch) {
          var ex = 'notify';
          var key = "all";
          var msg = "The event '"+ req.body.titolo + "' has been created";
          console.log(msg);
          ch.assertExchange(ex, 'topic', {durable: false});
          ch.publish(ex, key, new Buffer.from(msg));
        });
        setTimeout(function() { conn.close();}, 500);
      });
  }
});





//modifica dell'annuncio

router.put('/:id',(req, res) => {
  Evento.findOne({
    _id: req.params.id
    })
    .then(evento => {
      let errors = [];
      
      console.log(req.body.categoria);

      //server side validation
      if(!req.body.categoria){
        errors.push({text:'aggiungi una categoria'});
      }
      if(!req.body.titolo){
        errors.push({text:'aggiungi un titolo'});
      }
      if(!req.body.descrizione){
        errors.push({text:'aggiungi una descrizione'});
      }
      console.log(req.body.titolo);
      console.log(req.params.titolo);
      console.log(errors);
      console.log("___________________");
      console.log(req.body.descrizione);
      if(errors.length > 0){
        res.render('eventi/crea_Evento', {
          errors: errors,
          categoria: req.body.categoria,
          titolo: req.body.titolo,
          descrizione: req.body.descrizione,
        });
      } else {
        //var imageFile = req.body.file.filename;
        //console.log(req.file.path);
        //console.log(imageFile);
        //var image = fs.readFileSync(req.body.file.path);
        //console.log(image);
        //var type = 'image/png';

        //update values
        evento.categoria = req.body.categoria;
        evento.titolo = req.body.titolo;
        evento.descrizione = req.body.descrizione;
        evento.venditore = req.user.id;        
        evento.data = req.body.data + ' ' + req.body.time;
        evento.immagine = req.body.immagine;


        evento.save()
        .then(evento => {
          req.flash('success_msg', 'Evento aggiornato');
          res.redirect('/eventi/mieiEventi');
        })
      }
    });
});



//partecipa all'evento
router.put('/partecipa/:id', (req, res) => {
  console.log("sto cercando l'evento");
  Evento.findOne({
    _id: req.params.id
    })
    .then(evento => {
      //check if already joined
      utente.findOne({
        _id: req.user.id
      })
      .then(user => {
        if (user.eventi.indexOf(evento._id) != -1){
          req.flash('error_msg', 'Already joined');
          res.redirect('/eventi/mieiEventi');
        } else {
          //to add in both user (events) list and event (joiners) list
          evento.partecipanti.push(req.user.id);
          user.eventi.unshift(evento);
          user.save();

          //to send a notify to event's creator
          utente.findOne({
            _id: evento.creatore._id
          })
          .then(user2 => {
            if(user._id.toString() != evento.creatore._id.toString()){
              // Send a notify to event's creator
              amqp.connect(keys.ampqURI, function(err, conn) {
                conn.createChannel(function(err, ch) {
                  var ex = 'notify';
                  var key = user2.email;
                  var msg = req.user.nome + " " + req.user.cognome + " has joined your event '" + evento.titolo + "'";
                  console.log(msg);
                  ch.assertExchange(ex, 'topic', {durable: false});
                  ch.publish(ex, key, new Buffer.from(msg));
                });
                setTimeout(function() { conn.close();}, 500);
              });

              
            }
          });

          evento.save()
            .then(evento => {
              req.flash('success_msg', 'Event joined');
              res.redirect('/eventi/mieiEventi');
            });
        }
      });
    });
});











//rimuovere evento
router.delete('/:id', (req, res) => {

  Evento.findOne({
    _id: req.params.id
    }).then(evento =>{
      if(evento.partecipanti.length > 0){

        for(i = 0; i < evento.partecipanti.length; i++){
          utente.findOne({
            _id: evento.partecipanti[i]._id
          }).then(user => {
            if(user._id.toString() != evento.creatore._id.toString()){
              // Send a notify to all joiners
              amqp.connect(keys.amqpURI, function(err, conn) {
                conn.createChannel(function(err, ch) {
                  var ex = 'notify';
                  var key = user.email;
                  var msg = "ATTENTION: the event '" + evento.titolo + "' that you're joined has been canceled";
                  console.log(msg);
                  ch.assertExchange(ex, 'topic', {durable: false});
                  ch.publish(ex, key, new Buffer.from(msg));
                });
                
                setTimeout(function() {conn.close();}, 500);
              });
            }
            //to delete also in the user (events) list
            user.eventi.pull(evento);
            user.save();
          })
        }
      }
    }).then(() =>{
      Evento.deleteOne({
        _id: req.params.id
        })
        .then(evento => {
          req.flash('error_msg', 'Evento rimosso');
          res.redirect('/eventi/mieiEventi');
        });
    });
 
});

module.exports = router;