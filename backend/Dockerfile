# Étape 1 : build avec Node.js
FROM node:18-alpine AS build

WORKDIR /app
COPY . .

# Installer les dépendances
RUN npm install -g npm@11.6.2

# Étape 2 : runtime
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app /app

# Exposer le port de l'API
EXPOSE 4000

# Lancer le backend
CMD ["npm", "start"]
