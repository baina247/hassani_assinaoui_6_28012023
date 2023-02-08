// Importer le module Multer
const multer = require('multer');

// Définir un dictionnaire de formats d'images
const MIME_TYPES = {
    'images/jpg': 'jpg',
    'images/jpeg': 'jpg',
    'images/png': 'png'
};

// Définir l'objet de configuration pour multer
const storage = multer.diskStorage({
    // Spécifiez le dossier de destination pour les fichiers téléchargés
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    // Spécifiez le nom de fichier pour les fichiers téléchargés
    filename: (req, file, callback) => {
        // Remplacer les espaces dans le nom de fichier d'origine par des traits de soulignement
        const name = file.originalname.split(' ').join('_');
        // Obtenir l'extension de fichier basée sur le type mime
        const extension = MIME_TYPES[file.mimetype];
        // Concaténer le nom du fichier, l'horodatage actuel et l'extension
        callback(null, name + Date.now() + '.' + extension);
    }
});

// Exportez l'instance de multer, configurée pour gérer des fichiers uniques avec le nom "image"
module.exports = multer({ storage }).single('image');
