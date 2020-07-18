const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');


//carico modulo utente
require('../models/Utente');
const User = mongoose.model('utenti');

//routes d'accesso
router.get('/login', (req,res) =>{
  res.render('auth/login');
});


//routes d'iscrizione
router.get('/iscriviti', (req,res) =>{
  res.render('auth/iscriviti');
});



//routes della pagina utente
router.get('/userPage', ensureAuthenticated, (req,res) =>{
  res.render('auth/paginaUtente');
});


//form per l'accesso

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/welcome',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req,res, next);
});


// Form iscrizione
router.post('/registrazione', (req, res) => {
  let errors = [];

  if(req.body.password != req.body.password2){
    errors.push({text:'la password non coincide'});
  }

  if(req.body.password.length < 6){
    errors.push({text:'La password deve contenere almeno 6 caratteri'});
  }

	//validazione server
  if(errors.length > 0){
    res.render('auth/iscriviti', {
      errors: errors,
      nome: req.body.nome,
      cognome: req.body.cognome,
      email: req.body.email,
    });
  } else {
    User.findOne({email: req.body.email})       //controlla se la mail già esiste
      .then(user =>{
        if(user){
          req.flash('error_msg', 'Email già usata');
          res.redirect('/auth/iscriviti');
        } else{
          var role;
          if (req.body.ruolo == "gestore"){
            role = true;
          }
          else{
            role = false;
          }
          console.log(role);
          const newUser = new User({
            nome: req.body.nome,
            cognome: req.body.cognome,
            email: req.body.email,
            password: req.body.password,
            ruolo: req.body.ruolo,
            info: role,     
          });
          bcrypt.genSalt(10, (err,salt) => {			//criptare la password 
            bcrypt.hash(newUser.password, salt, (err, hash) => { //(salt è un input extra per una funzione che fa hashing sui dati)
              if(err) throw err;                          
              newUser.password = hash; 
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'Sei registrato, per favore autenticati');
                  res.redirect('/auth/login');
                })
                .catch(err => {
                  console.log(err);
                  return;
                });
              });
            });
          }
        });
      }
  });
  
  
// auth con dropbox
router.get('/dropbox', passport.authenticate('dropbox-oauth2'));

// ritorno dalla autenticazione
router.get('/dropbox/callback', 
    passport.authenticate('dropbox-oauth2', {
        successRedirect:'/welcome', 
        failureRedirect: '/auth/login' 
    })
);


// auth con google
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

// callback route di google per il redirect
router.get('/google/redirect', 
  passport.authenticate('google',  {
    successRedirect: '/welcome',
    failureRedirect: '/auth/login'  
  })
);

// utente disconnesso
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Ti sei disconnesso');
  res.redirect('/auth/login');
});

module.exports = router;