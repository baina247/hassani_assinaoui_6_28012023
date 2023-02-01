const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const sauceCtrl = require('../controllers/sauce');

//Récupérer toutes les sauces, nécessite une authentification via le middleware d'authentification.
router.get('/api/sauces', auth, sauceCtrl.getAllSauces);
//Récupérer une seule sauce par son ID, nécessite une authentification via le middleware d'authentification. 
router.get('/api/sauces/:id', auth, sauceCtrl.getOneSauce);
//Créer une nouvelle sauce, nécessite une authentification via le middleware d'authentification.
router.post('/api/sauces', auth, sauceCtrl.creatSauce);
//Mettre à jour une sauce par son ID, nécessite une authentification via le middleware d'authentification et un middleware Multer pour gérer le téléchargement d'un fichier.
router.put('/api/sauces/:id', auth, multer, sauceCtrl.modifySauce);
//Supprimer une sauce par son ID, nécessite une authentification via le middleware d'authentification.
router.delete('/api/sauces/:id', auth, sauceCtrl.deleteSauce);
//Manipuler likes pour une sauce, nécessite une authentification via le middleware d'authentification.
router.post('/api/sauces/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;