# Guide de démarrage rapide GTI

## 🚀 Installation en 5 minutes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
```

Éditer `.env` et remplir au minimum :
- `DATABASE_URL` : Votre connexion PostgreSQL
- `USER_EMAIL` : Votre email pour recevoir les notifications
- `CRON_SECRET` : Un mot de passe aléatoire

### 3. Configurer l'email (Gmail)
1. Allez sur https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Créez un "Mot de passe d'application"
4. Utilisez ce mot de passe dans `EMAIL_PASS`

### 4. Initialiser la base de données
```bash
npx prisma db push
```

### 5. Lancer l'application
```bash
npm run dev
```

Ouvrez http://localhost:3000

## ✅ Configuration initiale

### 1. Accédez aux paramètres
http://localhost:3000/settings

### 2. Configurez votre budget
- Budget annuel : 1000€ (exemple)
- Budget mensuel max : 100€ (exemple)
- Taille max de position : 200€ (exemple)

### 3. Ajustez les seuils (recommandations par défaut)
- COMBO20 minimum : 0.95
- COMBO50 minimum : 0.92
- Force de signal minimum : 70/100

### 4. Ajoutez vos premiers actifs
Exemples pour commencer :
- **S&P 500** : Symbol `SPX500`, Name `S&P 500`, Type `INDEX`
- **Or** : Symbol `XAUUSD`, Name `Gold`, Type `COMMODITY`

### 5. Testez un scan manuel
Retournez au dashboard et cliquez sur "Scan manuel"
Entrez votre `CRON_SECRET` quand demandé.

## 📧 Tester les emails

Créez un fichier de test :
```javascript
// test-email.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'VOTRE_EMAIL',
    pass: 'VOTRE_MOT_DE_PASSE_APP'
  }
})

transporter.sendMail({
  from: 'VOTRE_EMAIL',
  to: 'VOTRE_EMAIL',
  subject: 'Test GTI',
  text: 'Email de test GTI fonctionne !'
}).then(() => console.log('✅ Email envoyé'))
  .catch(err => console.error('❌ Erreur:', err))
```

```bash
node test-email.js
```

## 🌐 Déployer sur Vercel

### Option 1 : Via GitHub (recommandé)
1. Push vers GitHub
```bash
git add .
git commit -m "Setup GTI"
git push origin main
```

2. Sur vercel.com :
   - Import repository
   - Ajoutez toutes les variables d'environnement
   - Deploy

3. Configurez Vercel Postgres :
   - Ajoutez "Postgres" à votre projet
   - Notez la `DATABASE_URL`

4. Initialisez la DB :
```bash
DATABASE_URL="postgres://..." npx prisma db push
```

### Option 2 : Via CLI Vercel
```bash
npm i -g vercel
vercel
```

## 🔄 Automatiser les scans

### Avec Vercel Cron
Le fichier `vercel.json` est déjà configuré pour scanner 3x/jour.

### Avec cron-job.org
1. Créez un compte sur https://cron-job.org
2. Créez un nouveau cronjob :
   - URL : `https://votre-app.vercel.app/api/scan`
   - Type : POST
   - Body : `{"secret":"VOTRE_CRON_SECRET"}`
   - Schedule : `0 9,15,21 * * *`

## 🐛 Problèmes courants

### Prisma : "Can't reach database"
- Vérifiez que PostgreSQL est lancé
- Vérifiez votre `DATABASE_URL`

### Emails non reçus
- Vérifiez que vous utilisez un "Mot de passe d'application" Gmail
- Vérifiez les spams
- Testez avec le script test-email.js

### Build error sur Vercel
- Assurez-vous que toutes les variables d'env sont configurées
- Vérifiez les logs de build

### "Database schema is not in sync"
```bash
npx prisma db push
```

## 📱 Accès depuis mobile

Pour tester depuis votre téléphone en local :
1. Trouvez votre IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Utilisez `http://VOTRE_IP:3000` sur mobile
3. Assurez-vous d'être sur le même réseau WiFi

## 🎯 Prochaines étapes

1. ✅ Configurez vos actifs favoris
2. ✅ Testez un scan manuel
3. ✅ Vérifiez que les emails arrivent
4. ✅ Ajustez vos seuils selon vos préférences
5. ✅ Déployez sur Vercel
6. ✅ Configurez les scans automatiques

## 💡 Conseils

- Commencez avec des seuils conservateurs (COMBO20 > 0.95)
- Testez en paper trading avant d'investir réellement
- Consultez toujours le contexte macro-économique
- N'investissez que ce que vous pouvez vous permettre de perdre

Bon investissement ! 🚀
