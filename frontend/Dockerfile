# Étape 1 : Build de l'application avec Node
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers et construire l'app
COPY . .
RUN npm run build

# Étape 2 : Nginx pour servir l'app construite
FROM nginx:alpine

# Supprimer la config par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier les fichiers build dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port utilisé par Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
