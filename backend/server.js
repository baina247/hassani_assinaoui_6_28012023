const http = require('http');
const app = require('./app');

// Normaliser le numéro de port
const normalizePort = val => {
  const port = parseInt(val, 10);

  // Si le port est un nombre, renvoyez-le
  if (isNaN(port)) {
    return val;
  }
  // Si le port est un nombre positif, renvoyez-le
  if (port >= 0) {
    return port;
  }
  // Sinon, retourne faux
  return false;
};

// Obtenez le port à partir de la variable d'environnement ou par défaut à 3000
const port = normalizePort(process.env.PORT || '3000');
// Définir le port pour l'application Express
app.set('port', port);

// Gestionnaire d'erreurs pour le serveur
const errorHandler = error => {
  // Si l'erreur n'est pas liée au serveur qui écoute
  if (error.syscall !== 'listen') {
    throw error;
  }
  // Obtenir l'adresse et la chaîne de liaison du serveur
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  // Gérer différents codes d'erreur
  switch (error.code) {
    // Si l'erreur est que le port nécessite des privilèges élevés
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    // Si l'erreur est que le port est déjà utilisé
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    // Pour toutes les autres erreurs, lancez l'erreur
    default:
      throw error;
  }
};

// Créer un serveur à l'aide de l'application Express
const server = http.createServer(app);

// Écouter les événements d'erreur sur le serveur
server.on('error', errorHandler);

// Écoutez l'événement 'listening' sur le serveur
server.on('listening', () => {
  // Obtenir l'adresse et la chaîne de liaison du serveur
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  
  console.log('Listening on ' + bind);
});

// Commencer à écouter sur le port spécifié
server.listen(port);
