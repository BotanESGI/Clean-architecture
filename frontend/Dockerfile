# Utilise une image Node officielle
FROM node:20

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installe les dépendances
RUN npm install

# Copie le reste du code
COPY . .

# Compile le TypeScript
RUN npm run build

# Expose le port utilisé par l’API
EXPOSE 4000

# Lance l’application
CMD ["npm", "run", "start"]