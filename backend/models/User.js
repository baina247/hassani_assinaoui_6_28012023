const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//Création du schéma d'utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
//Vérification d'utilisateur
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);