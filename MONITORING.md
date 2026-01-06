# GTI - Système de Surveillance Continue des Prix

## Vue d'ensemble

GTI surveille maintenant continuellement les prix des actifs et vous envoie automatiquement des notifications par email lorsque les conditions d'achat sont réunies.

## Comment ça fonctionne

### 1. Surveillance Automatique

L'application analyse automatiquement tous vos actifs **toutes les heures** grâce à Vercel Cron Jobs.

**Fréquence:** Chaque heure (0 * * * *)
**Endpoint:** `/api/scan`
**Configuration:** `vercel.json`

### 2. Conditions de Notification

Une notification est créée et un email est envoyé lorsque **TOUTES** ces conditions sont remplies:

- `COMBO20 >= 0.92` (par défaut) - MA20 proche de la bande de Bollinger inférieure
- `COMBO50 >= 0.90` (par défaut) - MA50 proche de la bande de Bollinger inférieure
- `Signal Strength >= 60` (par défaut) - Force du signal suffisante
- Budget disponible >= 50€

#### Calcul des Indicateurs COMBO

```
COMBO20 = MA20 / Bollinger_Lower
COMBO50 = MA50 / Bollinger_Lower
```

Quand ces ratios approchent 1.0, cela signifie que:
- Les moyennes mobiles (MA20/MA50) convergent vers la bande de Bollinger inférieure
- Le prix est dans une zone de survente potentielle
- C'est un signal d'opportunité d'achat

### 3. Calcul de la Force du Signal (Signal Strength)

Le système attribue des points selon plusieurs critères:

| Critère | Points | Description |
|---------|--------|-------------|
| COMBO20 ≥ 0.98 | +40 | Signal très fort: alignement quasi-parfait |
| COMBO20 ≥ 0.95 | +30 | Signal fort |
| COMBO20 ≥ 0.92 | +15 | Signal modéré |
| COMBO50 ≥ 0.95 | +30 | Tendance long terme favorable |
| COMBO50 ≥ 0.90 | +20 | Tendance long terme acceptable |
| Prix ≤ BB_Lower × 1.02 | +20 | Prix en zone de survente |
| Prix < MA20 ET Prix < MA50 | +10 | Potentiel de rebond |
| Bandes de Bollinger resserrées | +5 | Mouvement imminent |

**Recommandations:**
- Signal Strength ≥ 80: **STRONG_BUY** 🚀
- Signal Strength ≥ 60: **BUY** 📈
- Signal Strength ≥ 40: **HOLD** ⏸️
- Signal Strength < 40: **WAIT** ⏳

### 4. Gestion du Budget

#### Budget Mensuel
- Budget max par mois: **2000€** (configurable)
- Réinitialisation automatique chaque début de mois
- Suivi en temps réel de la consommation

#### Budget Annuel
- Budget max par an: **20000€** (configurable)
- Réinitialisation automatique chaque début d'année
- Protection contre le sur-investissement

#### Montant Suggéré par Notification

Le montant suggéré est calculé intelligemment:

```typescript
montant_base = min(
  maxPositionSize,        // Ex: 500€
  budget_mensuel_restant,
  budget_annuel_restant
)

// Bonus selon la force du signal (0% à 50% de bonus)
bonus = (signalStrength - 70) / 30
montant_final = montant_base × (1 + bonus × 0.5)
```

**Exemple:**
- Signal Strength = 85
- Budget restant = 1500€
- Max position = 500€

```
bonus = (85 - 70) / 30 = 0.5
montant = 500€ × (1 + 0.5 × 0.5) = 500€ × 1.25 = 625€
montant_final = min(625€, 500€) = 500€  // Plafonné au max position
```

### 5. Notifications Email

Lorsqu'une opportunité est détectée, vous recevez un email contenant:

- 📊 **Données du marché**: Prix actuel, MA20, MA50, Bollinger Bands
- 🎯 **Indicateurs COMBO**: COMBO20, COMBO50
- 💪 **Force du signal**: Score et recommandation
- 💰 **Montant suggéré**: Calculé selon votre budget et la force du signal
- 📝 **Analyse détaillée**: Justification du signal
- 🔗 **Actions rapides**: Liens vers le dashboard et les brokers

## Configuration

### Modifier les Seuils

Accédez au dashboard et cliquez sur "⚙️ Paramètres" pour ajuster:

- **Seuil COMBO20 minimum** (défaut: 0.92)
- **Seuil COMBO50 minimum** (défaut: 0.90)
- **Force du signal minimum** (défaut: 60)
- **Budget mensuel maximum** (défaut: 2000€)
- **Budget annuel maximum** (défaut: 20000€)
- **Taille maximale d'une position** (défaut: 500€)
- **Activer/Désactiver les notifications email**

### Modifier la Fréquence de Surveillance

Par défaut, le scan s'exécute **toutes les heures**.

Pour modifier la fréquence, éditez `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scan",
      "schedule": "0 * * * *"  // Chaque heure
    }
  ]
}
```

**Exemples de fréquences:**

| Fréquence | Cron Expression | Description |
|-----------|----------------|-------------|
| Toutes les heures | `0 * * * *` | À chaque heure pile (recommandé) |
| Toutes les 30 min | `*/30 * * * *` | Toutes les 30 minutes |
| Toutes les 4 heures | `0 */4 * * *` | Toutes les 4 heures |
| 3x par jour | `0 9,15,21 * * *` | À 9h, 15h et 21h |
| Une fois par jour | `0 10 * * *` | Tous les jours à 10h |

**Note:** Les plans gratuits Vercel ont des limites sur l'exécution des cron jobs.

## Test en Local

Pour tester le système de scanning manuellement:

1. Ouvrez le dashboard: http://localhost:3000
2. Cliquez sur "🔍 Scanner manuellement"
3. Entrez le secret cron (défini dans `.env`): `test123456`
4. Le scan s'exécute et affiche les résultats

## Déploiement sur Vercel

Après déploiement sur Vercel:

1. **Vérification du Cron Job:**
   - Allez dans votre projet Vercel → Settings → Cron Jobs
   - Vous devriez voir: `/api/scan` avec la fréquence configurée

2. **Logs de Surveillance:**
   - Vercel → Deployments → [Votre deployment] → Functions
   - Cliquez sur `/api/scan` pour voir les logs d'exécution

3. **Variables d'Environnement:**
   - Assurez-vous que toutes les variables de `.env` sont configurées dans Vercel
   - Vercel → Settings → Environment Variables

## Sources de Données

Le système utilise plusieurs sources de prix avec fallback automatique:

1. **Yahoo Finance** (principale - gratuit, illimité)
2. **Alpha Vantage** (fallback 1 - 25 req/jour gratuit)
3. **Twelve Data** (fallback 2 - 800 req/jour gratuit)
4. **Mock Data** (dernier recours pour les tests)

Si une source échoue, le système bascule automatiquement sur la suivante.

## Workflow Complet

```
1. Vercel Cron déclenche /api/scan toutes les heures
        ↓
2. Le système récupère tous les actifs actifs (SPX500, XAUUSD, etc.)
        ↓
3. Pour chaque actif:
   - Récupère les données de prix (Yahoo/Alpha/Twelve)
   - Calcule MA20, MA50, Bollinger Bands
   - Calcule COMBO20, COMBO50
   - Évalue la force du signal
        ↓
4. Si les conditions sont remplies:
   - Calcule le montant suggéré
   - Crée une notification dans la base de données
   - Envoie un email d'alerte
        ↓
5. Vous consultez le dashboard pour:
   - Voir toutes les notifications
   - Analyser les signaux
   - Valider ou rejeter les opportunités
   - Ouvrir une position via les boutons broker
        ↓
6. Si vous validez une position:
   - Le système enregistre votre entrée
   - Le budget est mis à jour
   - Vous pouvez suivre le P&L en temps réel
```

## Troubleshooting

### Je ne reçois pas d'emails

1. Vérifiez que `emailNotifications` est activé dans les paramètres
2. Vérifiez les variables d'environnement email (EMAIL_USER, EMAIL_PASS)
3. Consultez les logs Vercel pour voir les erreurs

### Le cron ne s'exécute pas

1. Vérifiez que `vercel.json` est bien à la racine du projet
2. Vérifiez les logs dans Vercel → Cron Jobs
3. Sur le plan gratuit, il peut y avoir des délais

### Les données de prix sont incorrectes

1. Consultez les logs pour voir quelle source est utilisée
2. Vérifiez les clés API (ALPHA_VANTAGE_API_KEY, TWELVE_DATA_API_KEY)
3. Certains symboles peuvent nécessiter des mappings spéciaux

## Support

Pour toute question ou problème:
- Consultez les logs dans Vercel
- Vérifiez la console du navigateur sur le dashboard
- Contactez le support technique
