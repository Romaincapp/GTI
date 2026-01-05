# Configuration locale GTI

Votre base de données Vercel utilise AWS RDS avec authentification IAM (sans mot de passe).
Pour développer en local, vous avez deux options :

## Option 1 : PostgreSQL local (Recommandé)

### 1. Installer PostgreSQL sur Windows

1. Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
2. Lancez l'installeur
3. Notez le mot de passe que vous choisissez pour l'utilisateur `postgres`
4. Gardez le port par défaut : `5432`

### 2. Créer la base de données

Ouvrez PowerShell ou CMD et exécutez :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données GTI
CREATE DATABASE gti;

# Quitter
\q
```

### 3. Configurer .env.local

Modifiez la ligne 15 de votre fichier `.env.local` :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/gti?schema=public"
```

Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe que vous avez choisi lors de l'installation.

### 4. Initialiser la base de données

```bash
npx prisma db push
npx tsx scripts/seed.ts
```

---

## Option 2 : PostgreSQL avec Docker

Si vous avez Docker installé :

### 1. Créer un fichier docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gti
    ports:
      - "5432:5432"
    volumes:
      - gti-db:/var/lib/postgresql/data

volumes:
  gti-db:
```

### 2. Lancer PostgreSQL

```bash
docker-compose up -d
```

### 3. Votre .env.local est déjà configuré

La ligne actuelle fonctionne :
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gti?schema=public"
```

### 4. Initialiser

```bash
npx prisma db push
npx tsx scripts/seed.ts
```

---

## Option 3 : Se connecter à AWS RDS en local (Avancé)

Pour utiliser directement la base Vercel AWS en local :

### Prérequis
- AWS CLI installé
- Credentials AWS configurés avec les bonnes permissions

### Configuration

1. Installer AWS CLI : https://aws.amazon.com/cli/

2. Configurer les credentials (demandez à Vercel ou configurez IAM)

3. Utiliser un driver spécial pour Prisma qui supporte IAM

**Note :** Cette option est complexe et non recommandée pour débuter.

---

## ✅ Recommandation

**Pour commencer :** Utilisez l'**Option 1** (PostgreSQL local).
- C'est simple
- Rapide à configurer
- Pas de coûts
- Vous pouvez tester sans toucher à la production

**En production :** Vercel utilisera automatiquement AWS RDS avec IAM.

---

## 🚀 Après configuration

Une fois votre base locale configurée :

```bash
# Installer les dépendances
npm install

# Générer Prisma Client
npx prisma generate

# Créer les tables
npx prisma db push

# Ajouter des données de test
npx tsx scripts/seed.ts

# Lancer l'app
npm run dev
```

Votre application sera disponible sur http://localhost:3000
