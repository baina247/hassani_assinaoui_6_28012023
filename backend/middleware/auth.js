const jwt = require('jsonwebtoken');

// Importez les variables d'environnement à partir du fichier .env
require("dotenv").config();

// Fonction middleware pour extraire le JWT de l'en-tête de la requête
module.exports = (req, res, next) => {
    try {
        // Obtenez le JWT à partir de l'en-tête "Autorisation"
        const token = req.headers.authorization.split(' ')[1];
        // Vérifiez le JWT à l'aide de la clé secrète spécifiée dans le fichier .env
        const decodedToken = jwt.verify(token, process.env.KEY_SECRET);
        // Extraire l'ID utilisateur du JWT décodé
        const userId = decodedToken.userId;
        // Attachez l'ID utilisateur à l'objet de requête pour une utilisation dans les middlewares et routes suivants
        req.auth = {
            userId: userId
        };
        // Appeler le prochain middleware ou gestionnaire de route
        next();
    } catch (error) {
        console.log(error);
        // Si le JWT n'est pas valide, renvoyez un statut 401 non autorisé et un message d'erreur
        res.status(401).json({ error });
    }
};
