const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const path = require("path");
const sauceRoutes = require("./routes/sauce");

// Importez les variables d'environnement à partir du fichier .env
require("dotenv").config();

// Connectez-vous à MongoDB en utilisant les variables d'environnement pour le nom d'hôte et le mot de passe
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.hostName +
      ":" +
      process.env.hostPw +
      "@" +
      process.env.hostUrl +
      "/" +
      process.env.hostConnection,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion réussie à MongoDB !"))
  .catch(() => console.log("Échec de la connexion à MongoDB !"));

// Initialiser l'application express
const app = express();

// Utiliser le middleware JSON
app.use(express.json());

// Mise en œuvre du CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Utiliser le middleware body-parser pour analyser les requêtes entrantes au format JSON
app.use(bodyParser.json());

// Utilisez les routes de la sauce
app.use("/api/sauces", sauceRoutes);

// Utilisez les routes utilisateurs
app.use("/api/auth", userRoutes);

// Servir des images de manière statique
app.use("/images", express.static(path.join(__dirname, "images")));

// Exporter l'application express
module.exports = app;
