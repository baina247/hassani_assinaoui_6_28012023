const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.creatSauce = (req, res, next) => {
    //parser l'objet requete
    const sauceObject = JSON.parse(req.body.sauce);
    //Suppression de l'id car générer par la databse
    delete sauceObject._id;
    //Suppression de userId qui as créer l'objet
    delete sauceObject._userId;
    //Création de notre objet
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        //Création de l'Url de notre objet
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    //Enregistré dans la database et retourne une promesse
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (error) => {
                    if (error) {
                        return res.status(500).json({ error });
                    }
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
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
                    return res.status(400).json({ message: 'Vous avez déjà aimé cette sauce !' });
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