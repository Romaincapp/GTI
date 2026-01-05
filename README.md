# GTI - Good Time Investment

Une application de DCA intelligent qui analyse les marchés financiers et vous notifie des opportunités d'investissement basées sur des indicateurs techniques avancés.

## 🎯 Fonctionnalités principales

### Analyse technique automatisée
- **Indicateurs COMBO20 et COMBO50** : Ratios propriétaires entre les moyennes mobiles (MA20/MA50) et la bande de Bollinger inférieure
- **Signal de force** : Système de notation 0-100 pour évaluer la qualité de l'opportunité
- **Détection automatique** : Scan périodique des actifs suivis

### Notifications intelligentes
- Notifications par email avec analyse détaillée
- Dashboard web avec toutes les opportunités
- Filtres par statut (En attente, Exécuté, Rejeté)

### Gestion du budget
- Budget annuel et mensuel configurable
- Allocation dynamique selon la force du signal
- Suivi des dépenses en temps réel

### Suivi des positions
- Enregistrement des entrées avec prix et quantité
- Calcul automatique des P&L
- Historique complet

### Intégration brokers
- Liens directs vers Trade Republic, Interactive Brokers, Degiro, eToro
- Possibilité d'ajouter vos liens d'affiliation

## 🚀 Installation rapide

Consultez [SETUP.md](SETUP.md) pour un guide détaillé étape par étape.

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Initialiser la base de données
npx prisma db push

# 4. Lancer l'application
npm run dev
```

## 🧮 Comprendre les indicateurs

### COMBO20 et COMBO50
- **COMBO20** = MA20 / Bollinger Bande Basse
- **COMBO50** = MA50 / Bollinger Bande Basse
- **Ratio proche de 1.00** = Signal fort (zone de survente potentielle)

### Force du signal (0-100)
- **STRONG_BUY** : Score ≥ 80
- **BUY** : Score ≥ 60
- **HOLD** : Score ≥ 40
- **WAIT** : Score < 40

## 📖 Documentation complète

Voir le README complet pour :
- Configuration détaillée
- API Reference
- Guide de déploiement Vercel
- Automatisation avec Cron
- Évolutions futures

## 🛠️ Stack technique

- **Frontend** : Next.js 14, React, TailwindCSS
- **Backend** : Next.js API Routes
- **Database** : PostgreSQL + Prisma ORM
- **Déploiement** : Vercel

## 👤 Auteur

Romain - [GitHub](https://github.com/Romaincapp)

---

**⚠️ Disclaimer** : Cette application est fournie à titre éducatif. Les investissements comportent des risques. Faites vos propres recherches avant d'investir
