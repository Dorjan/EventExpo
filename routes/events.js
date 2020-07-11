const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = mongoose.model('events');
const User = mongoose.model('users');
const {ensureAuthenticated} = require('../helpers/auth');
//const path = require('path');
//const fs = require('fs');
const amqp = require('amqplib/callback_api');
const keys = require('../config/keys.js');
//const geocoder = require('../utils/geocoder');
//const keys = require('../config/keys.js');
const NodeGeocoder = require('node-geocoder');
 


// route ricerca annunci
router.post('/ricerca', ensureAuthenticated, (req,res) => {
  //trova gli annunci creati dall'utente
    console.log(req.user);
    console.log(req.body.titolo);
    //console.log(req.body.descrizione);
    console.log(req.body.indirizzo);
    console.log(req.body.categoria);
    //console.log(req.user.annunci);
    
    
   Evento.find({$and :[{citta: req.body.citta },{categoria: req.body.categoria},{creatore:{ $ne: req.user}}]})
    .populate('eventi')
    .then(eventi_trovati => {
      console.log("eventi cercati");
      res.render('eventi/eventi_trovati', {
        eventi_trovati: eventi_trovati
      });
    })
});





// My events route
router.get('/mieiEventi', ensureAuthenticated, (req,res) => {
  //trova gli annunci creati dall'utente
  Event.find({
    creatore: req.user.id
    })
    .sort({dateCreation: 'desc'})
    .then(mieieventi => {

      User.findOne({
        _id:req.user.id
      })
      .populate('events')
      .then(utentetrovato => {
        
        // render both
        res.render('events/mieiEventi', {
          mieieventi:mieieventi,
          eventsjoined: utentetrovato.events
        });
      });
    });
});


// Create event route
router.get('/crea_Evento',ensureAuthenticated,(req,res) => {
  res.render('events/crea_Evento');
});

// Show Single event
router.get('/show/:id', (req, res) => {
  Event.findOne({
    _id: req.params.id
    })
    .populate('creatore')     //to access creator info
    .then(event => {
      res.render('events/show', {
        event:event
      });
    });
});

// List events form a user
router.get('/user/:userId', (req, res) => {
  Event.find({
    creatore: req.params.userId
    })
    .then(events => {
      res.render('events/userEvents', {
        events: events
      });
    });
});

// Edit event form
router.get('/modifica_Evento/:id', ensureAuthenticated, (req,res) => {
  Evento.findOne({
    _id: req.params.id
    })
    .then(event => {
      res.render('events/modifica_Evento', {
        event: event
      });
    });
});


// Process add event
router.post('/crea_Evento',(req,res) => {
  
  let errors = [];

  //server side validation
  if(!req.body.categoria){
    errors.push({text:'scegli una categoria '});
  }
  if(!req.body.titolo){
    errors.push({text:'scegli un titolo'});
  }

  if(errors.length > 0){
    res.render('events/crea_Evento', {
      errors: errors,
      categoria: req.body.categoria,
      titolo: req.body.titolo,
      descrizione: req.body.descrizione,
    });
  } else{
    
    const newEvent = new Event();
   
    newEvent.categoria= req.body.categoria;
    newEvent.titolo =  req.body.titolo;
    newEvent.descrizione =  req.body.descrizione;
    console.log(req.body.time);
    newEvent.data =  req.body.data + ' ' + req.body.time;
    newEvent.creatore = req.user.id;
    newEvent.immagine = req.body.immagine;
    newEvent.indirizzo = req.body.indirizzo;
    var stringa = req.body.indirizzo;
    var n = stringa.indexOf(",");
    var result = stringa.substring(n+1);
    newEvent.citta = result;

    
    
    newEvent.save().then(event => {
        console.log("evento creato");
        req.user.save();
        res.redirect('/events/mieiEventi');
      })
      // Send a notify to all users
      amqp.connect(keys.amqpURI,function(err,conn){
        conn.createChannel(function(err, ch) {
          var ex = 'notify';
          var key = "all";
          var msg = "L'evento'"+ req.body.titolo + "' è stato creato";
          console.log(msg);
          ch.assertExchange(ex, 'topic', {durable: false});
          ch.publish(ex, key, new Buffer.from(msg));
        });
        setTimeout(function() { conn.close();}, 500);
      });
    }
});

// edit form process
router.put('/:id',(req, res) => {
  Event.findOne({
    _id: req.params.id
    })
    .then(event => {
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
      console.log(errors);
      console.log("___________________");
      console.log(req.body.descrizione);

      if(errors.length > 0){
        res.render('events/crea_Evento', {
          errors: errors,
          categoria: req.body.categoria,
          titolo: req.body.titolo,
          descrizione: req.body.descrizione,
        });
      } else {

        event.categoria = req.body.categoria;
        event.titolo = req.body.titolo;
        event.descrizione = req.body.descrizione;
        event.venditore = req.user.id;        
        event.data = req.body.data + ' ' + req.body.time;
        event.immagine = req.body.immagine;

        for(i = 0; i < event.partecipanti.length; i++){
          User.findOne({
            _id: event.partecipanti[i]._id
          }).then(user => {
            if(user._id.toString() != event.creatore._id.toString()){
              // Send a notify to all joiners
              amqp.connect(keys.amqpURI, function(err, conn) {
                conn.createChannel(function(err, ch) {
                  var ex = 'notify';
                  var key = user.email;
                  var msg = "L'evento '" + req.body.descrizione + "' è stato modificato";
                  ch.assertExchange(ex, 'topic', {durable: false});
                  ch.publish(ex, key, new Buffer.from(msg));
                });
                setTimeout(function() { conn.close();}, 500);
              });
            }
          });
        }


        event.save()
        .then(event => {
          req.flash('success_msg', 'Evento aggiornato');
          res.redirect('/events/mieiEventi');
        })
      }
    });
});


// Join event process
router.put('/partecipa/:id', (req, res) => {
  console.log("sto cercando l'evento");
  Evento.findOne({
    _id: req.params.id
    })
    .then(event => {
      //check if already joined
      User.findOne({
        _id: req.user.id
      })
      .then(user => {
        if (user.events.indexOf(event._id) != -1){
          req.flash('error_msg', "Partecipi già all'evento");
          res.redirect('/events/mieiEventi');
        } else {
          //to add in both user (events) list and event (joiners) list
          event.partecipanti.push(req.user.id);
          user.events.unshift(event);
          user.save();

          //to send a notify to event's creator
          utente.findOne({
            _id: event.creatore._id
          })
          .then(user2 => {
            if(user._id.toString() != event.creatore._id.toString()){
              // Send a notify to event's creator
              amqp.connect(keys.amqpURI, function(err, conn) {
                conn.createChannel(function(err, ch) {
                  var ex = 'notify';
                  var key = user2.email;
                  var msg = req.user.nome + " " + req.user.cognome + " has joined your event '" + event.titolo + "'";
                  console.log(msg);
                  ch.assertExchange(ex, 'topic', {durable: false});
                  ch.publish(ex, key, new Buffer.from(msg));
                });
                setTimeout(function() { conn.close();}, 500);
              });
            }
          });

          event.save()
            .then(event => {
              req.flash('success_msg', "Ti sei unito all'evento");
              res.redirect('/events/mieiEventi');
            });
        }
      });
    });
});


// leave event process
router.put('/delete/:id', (req, res) => {
  // delete user in event (partecipanti) list
  Event.findOne({
    _id: req.params.id
    })
  
    .then(event => {
      event.partecipanti.pull(req.user.id);

      //to delete also in the user (events) list
      User.findOne({
          _id: req.user.id
        })
        .then(user => {
          //to send a notify to event's creator una notifica all'utente cha ha aggiunto
          User.findOne({
            _id: event.creatore._id
          })
          .then(user2 => {
            // Send a notify to event's creator
            if(user._id.toString() != event.creatore._id.toString()){
              amqp.connect(keys.amqpURI, function(err, conn) {
                conn.createChannel(function(err, ch) {
                  var ex = 'notify';
                  var key = user2.email;
                  var msg = req.user.nome + " " + req.user.cognome + " ha abbandonato il tuo evento" + event.titolo + "'";
                  ch.assertExchange(ex, 'topic', {durable: false});
                  ch.publish(ex, key, new Buffer.from(msg));
                });
                setTimeout(function() { conn.close();}, 500);
              });
            }
          user.events.pull(event);
          user.save();
        });

        });

      event.save()
        .then(event => {
          req.flash('error_msg', 'Evento abbandonato');
          res.redirect('/events/mieiEventi');
        });
    });
});


// delete event
router.delete('/:id', (req, res) => {

  Event.findOne({
    _id: req.params.id
    }).then(event =>{
      if(event.partecipanti.length > 0){

        for(i = 0; i < event.partecipanti.length; i++){
          User.findOne({
            _id: event.partecipanti[i]._id
          }).then(user => {
            if(user._id.toString() != event.creatore._id.toString()){
              // Send a notify to all joiners
              amqp.connect(keys.amqpURI, function(err, conn) {
                conn.createChannel(function(err, ch) {
                  var ex = 'notify';
                  var key = user.email;
                  var msg = "ATTENTION: the event '" + event.titolo + "' that you're joined has been canceled";
                  console.log(msg);
                  ch.assertExchange(ex, 'topic', {durable: false});
                  ch.publish(ex, key, new Buffer.from(msg));
                });
                
                setTimeout(function() {conn.close();}, 500);
              });
            }
            //to delete also in the user (events) list
            user.events.pull(event);
            user.save();
          })
        }
      }
    }).then(() =>{
      Event.deleteOne({
        _id: req.params.id
        })
        .then(event => {
          req.flash('error_msg', 'Evento rimosso');
          res.redirect('/events/mieiEventi');
        });
    });
 
});

module.exports = router;