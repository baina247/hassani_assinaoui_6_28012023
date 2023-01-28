const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//Création du schéma d'utilisateur
const UserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
//Vérification d'utilisateur
UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);