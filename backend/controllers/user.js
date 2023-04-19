const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

require("dotenv").config(); // charger les variables d'environnement à partir du fichier .env

// clé secrète JWT par défaut, peut être remplacée par la variable d'environnement KEY_SECRET
const JWT_SECRET = process.env.KEY_SECRET || "secretkey";

// fonction signUp pour gérer l'inscription de l'utilisateur
const signUp = (req, res, next) => {
  // déstructurer l'email et le mot de passe du corps de la requête
  const { email, password } = req.body;

  // si l'adresse e-mail ou le mot de passe n'est pas fourni, renvoie une erreur 400 Bad Request
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  // hacher le mot de passe avec bcrypt
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      // créer un nouvel objet utilisateur avec l'e-mail et le mot de passe haché
      const user = new User({ email, password: hash });
      // enregistrer l'utilisateur dans la base de données
      return user.save();
    })
    .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
    .catch((error) => {
      // si l'erreur est une erreur de clé en double MongoDB, renvoie une erreur 400 Bad Request
      if (error.name === "MongoError" && error.code === 11000) {
        return res.status(400).json({ error: "email existant déjà" });
      }
      // renvoie une erreur de serveur interne 500 pour toute autre erreur
      res.status(500).json({ error: "Échec de la création utilisateur" });
    });
};

// fonction logIn pour gérer la connexion de l'utilisateur
const logIn = (req, res, next) => {
  // déstructurer l'email et le mot de passe du corps de la requête
  const { email, password } = req.body;

  // si l'adresse e-mail ou le mot de passe n'est pas fourni, renvoie une erreur 400 Bad Request
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  // trouver l'utilisateur dans la base de données en fonction de son e-mail
  User.findOne({ email })
    .then((user) => {
      // si l'utilisateur n'est pas trouvé, renvoie une erreur 401 non autorisée
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }

      // comparer le mot de passe fourni avec le mot de passe haché dans la base de données
      return bcrypt.compare(password, user.password).then((valid) => {
        // si le mot de passe est incorrect, renvoie une erreur 401 Unauthorized
        if (!valid) {
          return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        // générer un jeton JWT à l'aide de l'ID utilisateur et de la clé secrète JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "24h",
        });
        // renvoyer l'ID utilisateur et le jeton JWT généré dans la réponse
        res.status(200).json({ userId: user._id, token });
      });
    })
    .catch((error) => {
      // s'il y a eu une erreur pendant le processus de connexion, renvoyer un état d'erreur 500 avec un message
      res.status(500).json({ error: "Failed to log in" });
    });
};

// Exporter les fonctions d'inscription et de connexion en tant qu'exportations du module
module.exports = { signUp, logIn };
