# Étape 1 : Build avec Node
FROM node:18-alpine AS builder
WORKDIR /app

# Copie des sources
COPY . .

# Installation des dépendances et build
RUN npm install
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine

# Supprimer la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copie de la config personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build Vite dans le dossier web de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
