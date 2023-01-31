const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const sauceCtrl = require('../controllers/sauce');

//middleware des objets attendu par le frontend
router.get('/api/sauces', auth, sauceCtrl.getAllSauces);
//Récupération d'un objet via son l'ID  
router.get('/api/sauces/:id', auth, sauceCtrl.getOneSauce);
//Création d'un objet
router.post('/api/sauces', auth, sauceCtrl.creatSauce);
//Modificationd de ressource + verification multer
router.put('/api/sauces/:id', auth, multer, sauceCtrl.modifySauce);
//Suppression de ressource
router.delete('/api/sauces/:id', auth, sauceCtrl.deleteSauce);
//Controle de like
router.post('/api/sauces/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;