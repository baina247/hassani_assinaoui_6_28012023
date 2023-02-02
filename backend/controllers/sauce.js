const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.creatSauce = (req, res, next) => {
    // Analyse de l'objet de requête
    const sauceObject = JSON.parse(req.body.sauce);
    // Suppression de l'identifiant tel qu'il sera généré par la base de données
    delete sauceObject._id;
    // Suppression de l'userId du créateur de l'objet
    delete sauceObject._userId;
    // Création de l'objet
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        // Création de l'URL de l'objet
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // Enregistrement de l'objet dans la base de données et retour d'une promesse
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    // Interroger la base de données pour toutes les sauces
    Sauce.find()
        .then(sauce => {
            // Si la requête réussit, renvoyez un code d'état 200 et les sauces dans le corps de la réponse
            res.status(200).json(sauce)
        })
        .catch(error => {
            // En cas d'erreur, renvoyez un code d'état 400 et le message d'erreur dans le corps de la réponse
            res.status(400).json({ error });
        });
};

exports.getOneSauce = (req, res, next) => {
    // Interroger la base de données pour une sauce avec l'ID fourni
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Si la sauce est trouvée, renvoyez un code d'état 200 et la sauce dans le corps de la réponse
            res.status(200).json(sauce)
        })
        .catch(error => {
            // S'il y a une erreur ou si la sauce n'est pas trouvée, renvoyez un code d'état 404 et le message d'erreur dans le corps de la réponse
            res.status(404).json({ error });
        });
};

exports.modifySauce = (req, res, next) => {
    // Vérifier si une image a été téléchargée dans la demande
    const sauceObject = req.file
        // Si une image a été téléchargée, ajoutez la propriété imageUrl à sauceObject
        ? {
            ...JSON.parse(req.body.sauce), // répandre le contenu de req.body.sauce dans l'objet
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // construire l'imageUrl à partir de req.protocol, req.get('host') et req.file.filename
        }
        // Si aucune image n'a été téléchargée, diffusez simplement le contenu de req.body dans sauceObject
        : { ...req.body };

    // Supprimer la propriété _userId de sauceObject
    delete sauceObject._userId;

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Vérifiez si l'utilisateur authentifié est le propriétaire de la sauce
            if (sauce.userId != req.auth.userId) {
                // Sinon, retourner un statut 401 avec un message "Non-autorisé"
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                // Si l'utilisateur est le propriétaire de la sauce, mettre à jour la sauce dans la base de données avec sauceObject
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    // Si la mise à jour a réussi, renvoyez un statut 200 avec un message "Sauce modifiée!"
                    .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
                    // Si la mise à jour a échoué, renvoie un statut 401 avec l'erreur
                    .catch(error => res.status(401).json({ error }));
            }
        })
        // Si la sauce avec l'identifiant donné n'a pas été trouvée dans la base de données, renvoie un statut 400 avec l'erreur
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    // Trouver la sauce avec l'ID spécifié dans les paramètres de la requête
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Vérifiez si l'utilisateur authentifié est le propriétaire de la sauce
            if (sauce.userId != req.auth.userId) {
                // Si ce n'est pas le cas, envoyez une réponse avec un code de statut 401 et un message "Non-autorisé"
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                // Si l'utilisateur authentifié est le propriétaire de la sauce, extrayez le nom du fichier de l'URL de l'image de la sauce
                const filename = sauce.imageUrl.split('/images/')[1];
                // Delete the image file from the file system
                fs.unlink(`images/${filename}`, (error) => {
                    if (error) {
                        // S'il y a une erreur lors de la suppression du fichier, envoyez une réponse avec un code d'état 500 et le message d'erreur
                        return res.status(500).json({ error });
                    }
                    // Si le fichier a été supprimé avec succès, supprimez la sauce de la base de données
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            // Si la sauce a été supprimée avec succès, envoyez une réponse avec un code d'état 200 et un message "Sauce supprimée !"
                            res.status(200).json({ message: 'Sauce supprimé !' });
                        })
                        .catch(error => {
                            // S'il y a une erreur lors de la suppression de la sauce, envoyez une réponse avec un code d'état 401 et le message d'erreur
                            res.status(401).json({ error });
                        });
                });
            }
        })
        .catch(error => {
            // S'il y a une erreur dans la recherche de la sauce, envoyez une réponse avec un code d'état 500 et le message d'erreur
            res.status(500).json({ error });
        });
};

exports.likeSauce = (req, res, next) => {
    // Obtenir la valeur like du corps de la requête
    const { like } = req.body;
    // Obtenir l'ID de l'utilisateur à partir de la requête
    const userId = req.auth.userId;

    // Trouver la sauce via l'ID dans la base de données
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Vérifier si l'utilisateur a liker la sauce
            if (like === 1) {
                // Vérifiez si l'utilisateur a déjà liker la sauce
                if (sauce.usersLiked.includes(userId)) {
                    return res.status(400).json({ message: 'Vous avez déjà liker cette sauce !' });
                } else if (sauce.usersDisliked.includes(userId)) {
                    // Si l'utilisateur n'a pas liker la sauce, supprimez son ID du tableau "usersDisliked"
                    const index = sauce.usersDisliked.indexOf(userId);
                    sauce.usersDisliked.splice(index, 1);
                    sauce.dislikes -= 1;
                }
                // Ajoutez l'ID de l'utilisateur au tableau `usersLiked`
                sauce.usersLiked.push(userId);
                sauce.likes += 1;
            } else if (like === -1) {
                // Vérifiez si l'utilisateur n'a pas déjà disliker la sauce
                if (sauce.usersDisliked.includes(userId)) {
                    return res.status(400).json({ message: 'Vous avez déjà disliker cette sauce !' });
                } else if (sauce.usersLiked.includes(userId)) {
                    // Si l'utilisateur a liker la sauce, supprimez son ID du tableau `usersLiked`
                    const index = sauce.usersLiked.indexOf(userId);
                    sauce.usersLiked.splice(index, 1);
                    sauce.likes -= 1;
                }
                // Ajoutez l'ID de l'utilisateur au tableau `usersDisliked`
                sauce.usersDisliked.push(userId);
                sauce.dislikes += 1;
            } else if (like === 0) {
                // Si l'utilisateur souhaite supprimer ce qu'il aime ou n'aime pas
                if (sauce.usersLiked.includes(userId)) {
                    // Si l'utilisateur a liker la sauce, supprimez son ID du tableau `usersLiked`
                    const index = sauce.usersLiked.indexOf(userId);
                    sauce.usersLiked.splice(index, 1);
                    sauce.likes -= 1;
                } else if (sauce.usersDisliked.includes(userId)) {
                    // Si l'utilisateur a disliker la sauce, supprimez son ID du tableau "usersDisliked"
                    const index = sauce.usersDisliked.indexOf(userId);
                    sauce.usersDisliked.splice(index, 1);
                    sauce.dislikes -= 1;
                } else {
                    return res.status(400).json({ message: 'Sauce pas encore été évaluée !' });
                }
            } else {
                // Si la valeur similaire n'est pas 1, 0 ou -1, renvoie une erreur
                return res.status(400).json({ message: 'Valeur like non valide. Il doit être soit 1, 0 ou -1.' });
            }
            // Enregistrer les informations mises à jour sur la sauce
            sauce.save()
                .then(() => {
                    // Envoyez une réponse avec les informations mises à jour sur les mentions Likes et dislikes
                    res.status(200).json({
                        message: 'Le statut like mis à jour',
                        likes: sauce.likes,
                        dislikes: sauce.dislikes
                    });
                })
                .catch(error => {
                    // S'il y a une erreur, envoyez une réponse avec l'erreura
                    res.status(401).json({ error });
                });
        })
};