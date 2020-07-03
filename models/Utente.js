const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  email:                  { type: String, required: true },
  nome:                   { type: String, required: true },
  cognome:                { type: String, required: true },
  googleId:               { type: String, required: false },
  dropboxId:              { type: String, required: false },
  password:               { type: String, required: false },
  regione:                 { type: String,required: false },
  eventi:                 [{ type: Schema.Types.ObjectId, ref:'eventi'}],
  ruolo:                  { type: String,required: false },
  info:                   { type: Boolean,required: false },
  data:                   { type: Date, default: Date.now}
});


UserSchema.methods.IsGestore = function(){
  return (this.ruolo === "gestore")
}

UserSchema.methods.IsUtente= function(){
  return (this.ruolo === "utente")
}

mongoose.model('utenti', UserSchema);