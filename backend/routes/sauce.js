const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const sauceCtrl = require('../controllers/sauce');

//Récupérer toutes les sauces, nécessite une authentification via le middleware d'authentification.
router.get('/', auth, sauceCtrl.getSauces);
//Récupérer une seule sauce par son ID, nécessite une authentification via le middleware d'authentification. 
router.get('/:id', auth, sauceCtrl.getOneSauce);
//Créer une nouvelle sauce, nécessite une authentification via le middleware d'authentification.
router.post('/', auth, multer, sauceCtrl.creatSauce);
//Mettre à jour une sauce par son ID, nécessite une authentification via le middleware d'authentification et un middleware Multer pour gérer le téléchargement d'un fichier.
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
//Supprimer une sauce par son ID, nécessite une authentification via le middleware d'authentification.
router.delete('/:id', auth, sauceCtrl.deleteSauce);
//Manipuler likes pour une sauce, nécessite une authentification via le middleware d'authentification.
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;