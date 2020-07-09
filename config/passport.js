
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;
const keys = require('./keys.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Utente = mongoose.model('utenti');

module.exports = function(passport){
  //da accedere tramite la form di log in
  passport.use('local',
      new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
      // verifico esistenza utente
      Utente.findOne({
        email:email
      }).then(user => {
        if(!user){
          return done(null, false, {message: 'nessun utente trovato'});
        }

        // corrispondenza password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch){
            return done(null, user, {message: 'utente esistente'});
          } else {
            return done(null, false, {message: 'Password sbagliata'});
          }
        });
      });
    }));

//to access by dropbox
passport.use('dropbox-oauth2',
new DropboxOAuth2Strategy({
  apiVersion: '2',
  clientID: keys.dropbox.clientID,
  clientSecret:keys.dropbox.clientSecret,
  callbackURL:'/auth/dropbox/callback'
}, (accessToken, refreshToken, profile, done) => {

  const newUser = {
    dropboxID: profile.id,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    email: profile.emails[0].value,
    info: true,
    ruolo: "gestore"
  }

  // Check for existing user
  Utente.findOne({
    email:profile.emails[0].value
  }).then(user => {
    if(user){
      // Return user
      done(null, user);
    } else {
      // Create user
      new Utente(newUser)
        .save()
        .then(user => done(null, user));
    }
  });
})
);


//to access by google
passport.use('google',
new GoogleStrategy({
  clientID: keys.google.clientID,
  clientSecret:keys.google.clientSecret,
  callbackURL:'/auth/google/redirect',
  proxy: true
}, (accessToken, refreshToken, profile, done) => {

  const newUser = {
    googleID: profile.id,
    nome: profile.name.givenName,
    cognome: profile.name.familyName,
    email: profile.emails[0].value,
    info: true,
    ruolo:"gestore"
  }

  // Check for existing user
  Utente.findOne({
    email:profile.emails[0].value
  }).then(user => {
    if(user){
      // Return user
      done(null, user);
    } else {
      // Create user
      new Utente(newUser)
        .save()
        .then(user => done(null, user));
    }
  })
})
);



    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
  
    passport.deserializeUser(function(id, done) {
        Utente.findById(id, function(err, user) {
            done(err, user);
        });
    });
}
