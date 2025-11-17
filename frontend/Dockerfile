FROM node:20

WORKDIR /app

# Installer PNPM
RUN npm install -g pnpm

# Copier les manifestes
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install

# Copier tout le code
COPY . .

EXPOSE 3000

# Démarrer Next.js en mode dev (hot reload)
CMD ["pnpm", "dev"]
