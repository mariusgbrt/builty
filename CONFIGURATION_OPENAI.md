# 🤖 Configuration OpenAI pour la Génération de Devis IA

Date : 7 mars 2026  
Objectif : Activer le bouton "Créer avec IA" sur la page Devis

---

## 🎯 CONTEXTE

Votre application utilise **OpenAI GPT-4o** pour :
- 📝 Générer des devis à partir d'une description textuelle
- 📸 Générer des devis à partir de photos de chantier (vision IA)
- 💰 Utiliser automatiquement votre catalogue de tarifs

**Modèle utilisé** : `gpt-4o` (avec capacités vision)

---

## 💰 COÛTS OPENAI

### Tarification GPT-4o (2026)

- **Input** : ~$2.50 / 1M tokens
- **Output** : ~$10.00 / 1M tokens

### Estimation pour Builty

Pour un devis moyen avec description texte :
- Input : ~500 tokens (~$0.001)
- Output : ~300 tokens (~$0.003)
- **Coût par devis : ~$0.004 (0,004€)**

Pour un devis avec photos (1-3 images) :
- Input : ~1500-2000 tokens (~$0.004)
- Output : ~300 tokens (~$0.003)
- **Coût par devis : ~$0.007 (0,007€)**

### Budget mensuel estimé
- **50 devis/mois** : ~0,30€
- **100 devis/mois** : ~0,60€
- **500 devis/mois** : ~3€
- **1000 devis/mois** : ~6€

💡 **Conclusion** : Coût très faible, même pour une utilisation intensive !

---

## 📋 ÉTAPES DE CONFIGURATION

### ÉTAPE 1 : Créer un compte OpenAI

1. Allez sur : **https://platform.openai.com/signup**

2. Créez un compte avec :
   - Votre email professionnel
   - Mot de passe sécurisé

3. Vérifiez votre email

4. Configurez le paiement :
   - Allez dans "Settings" → "Billing"
   - Ajoutez une carte bancaire
   - Ajoutez du crédit (minimum 5$ recommandé)
   - ⚠️ **Important** : Configurez une limite de dépenses (ex: 20$/mois) pour éviter les surprises

---

### ÉTAPE 2 : Obtenir votre clé API

1. Connectez-vous sur : **https://platform.openai.com**

2. Allez dans **"API Keys"** (ou https://platform.openai.com/api-keys)

3. Cliquez sur **"Create new secret key"**

4. Donnez un nom : `Builty - Production`

5. **Permissions recommandées** :
   - Model capabilities : `All`
   - Ou seulement : `Model: gpt-4o`

6. Cliquez sur **"Create secret key"**

7. **⚠️ COPIEZ LA CLÉ IMMÉDIATEMENT** (vous ne pourrez plus la voir)
   - Format : `sk-proj-...` (environ 50 caractères)
   - Sauvegardez-la dans un endroit sécurisé (gestionnaire de mots de passe)

---

### ÉTAPE 3 : Installer Supabase CLI

Le Supabase CLI est nécessaire pour déployer les Edge Functions.

```bash
# Installation via npm (recommandé)
npm install -g supabase

# Vérifier l'installation
supabase --version
```

**Attendez que l'installation soit terminée** (~30 secondes).

---

### ÉTAPE 4 : Se connecter à Supabase

1. **Login Supabase** :
   ```bash
   supabase login
   ```
   - Cela ouvrira votre navigateur
   - Connectez-vous avec votre compte Supabase
   - Autorisez l'accès

2. **Lier votre projet** :
   ```bash
   cd /Users/mariusguibert/Downloads/project
   supabase link --project-ref ouelqflgypxbpkyaowfg
   ```
   - Entrez votre mot de passe Supabase si demandé
   - Confirmez le lien avec votre projet

---

### ÉTAPE 5 : Configurer la clé OpenAI dans Supabase

```bash
# Remplacez YOUR_OPENAI_API_KEY par votre vraie clé
supabase secrets set OPENAI_API_KEY=sk-proj-VOTRE_CLE_ICI
```

**Exemple** :
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-abc123def456...
```

✅ Vous devriez voir : `Finished supabase secrets set.`

---

### ÉTAPE 6 : Déployer la Edge Function

```bash
supabase functions deploy generate-quote-ai
```

**Ce qui se passe** :
1. Le CLI compile la fonction TypeScript
2. L'uploade sur Supabase
3. La rend disponible via URL

✅ **Succès si vous voyez** :
```
Deployed Function generate-quote-ai on project ouelqflgypxbpkyaowfg
URL: https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/generate-quote-ai
```

---

### ÉTAPE 7 : Vérifier la configuration

#### Vérifier les secrets
```bash
supabase secrets list
```

Vous devriez voir `OPENAI_API_KEY` dans la liste.

#### Vérifier les fonctions déployées
```bash
supabase functions list
```

Vous devriez voir `generate-quote-ai` avec le statut `deployed`.

---

### ÉTAPE 8 : Tester la fonction

#### Test depuis l'interface Builty

1. Allez sur la page **"Devis"**
2. Cliquez sur **"Créer avec IA"**
3. Essayez ces exemples :

**Test 1 : Description texte**
```
Je veux refaire ma salle de bain : 
- Carrelage mural et sol (12m²)
- Remplacement baignoire par douche italienne
- Nouveau meuble vasque
- Peinture plafond
```

**Test 2 : Avec catalogue de tarifs**
- D'abord, ajoutez des services dans **Paramètres → Catalogue de tarifs**
- Puis créez un devis avec IA
- L'IA devrait **utiliser vos tarifs** automatiquement

**Test 3 : Avec photo** (si vous uploadez une image)
- Prenez une photo d'un chantier ou d'une pièce à rénover
- Uploadez-la dans le formulaire IA
- L'IA analysera la photo et générera un devis

---

## 🔍 DÉPANNAGE

### ❌ Erreur : "OPENAI_API_KEY is not configured"

**Cause** : La clé n'est pas configurée dans Supabase

**Solution** :
```bash
supabase secrets set OPENAI_API_KEY=votre_clé
```

---

### ❌ Erreur : "Incorrect API key provided"

**Cause** : La clé OpenAI est invalide ou expirée

**Solutions** :
1. Vérifiez que vous avez copié la clé en entier
2. Créez une nouvelle clé sur https://platform.openai.com/api-keys
3. Reconfigurez :
   ```bash
   supabase secrets set OPENAI_API_KEY=nouvelle_clé
   ```

---

### ❌ Erreur : "You exceeded your current quota"

**Cause** : Votre compte OpenAI n'a plus de crédit

**Solutions** :
1. Allez sur https://platform.openai.com/account/billing
2. Ajoutez du crédit (minimum 5$)
3. Vérifiez vos limites de dépenses

---

### ❌ Erreur : "Model gpt-4o not found"

**Cause** : Votre compte OpenAI n'a pas accès à GPT-4o

**Solutions** :
1. Vérifiez que vous avez ajouté du crédit (requis pour GPT-4o)
2. Ou modifiez la fonction pour utiliser `gpt-4-turbo` ou `gpt-3.5-turbo` :

Éditez `/supabase/functions/generate-quote-ai/index.ts` :
```typescript
model: type === 'image' ? 'gpt-4o' : 'gpt-4-turbo', // ou 'gpt-3.5-turbo'
```

Puis redéployez :
```bash
supabase functions deploy generate-quote-ai
```

---

### ❌ Erreur : "Function not found"

**Cause** : La fonction n'a pas été déployée

**Solution** :
```bash
cd /Users/mariusguibert/Downloads/project
supabase functions deploy generate-quote-ai
```

---

### ❌ Erreur : "CORS error"

**Cause** : Problème de permissions

**Solution** :
Les headers CORS sont déjà configurés dans le code. Si le problème persiste :
1. Vérifiez que l'URL Supabase est correcte dans `.env`
2. Redéployez la fonction

---

## 🧪 TEST MANUEL (via cURL)

Pour tester la fonction directement sans passer par l'interface :

```bash
curl -X POST \
  https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/generate-quote-ai \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Je veux peindre un mur de 20m²"
  }'
```

**Remplacez** `VOTRE_ANON_KEY` par la clé dans votre `.env` :
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZWxxZmxneXB4YnBreWFvd2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjk0OTYsImV4cCI6MjA4MTgwNTQ5Nn0.2wBLuw0J4aVAv3fzI9b8pGwVtKJ3uxPX_ExefLCnaiA
```

**Réponse attendue** (JSON) :
```json
{
  "title": "Devis Peinture",
  "description": "Peinture murale intérieure",
  "items": [
    {
      "description": "Peinture mur intérieur",
      "quantity": 20,
      "unit": "m²",
      "unit_price": 15.00
    }
  ]
}
```

---

## 📊 MONITORING ET LOGS

### Voir les logs de la fonction

```bash
supabase functions logs generate-quote-ai
```

**Ou** dans le dashboard Supabase :
1. Allez sur https://supabase.com/dashboard/project/ouelqflgypxbpkyaowfg
2. Menu latéral → **"Edge Functions"**
3. Cliquez sur **"generate-quote-ai"**
4. Onglet **"Logs"**

### Métriques OpenAI

Suivez votre consommation sur :
- https://platform.openai.com/usage

Vous y verrez :
- Nombre de requêtes
- Coût par jour/mois
- Modèles utilisés

---

## 🔐 SÉCURITÉ

### ✅ Bonnes pratiques

1. **Ne jamais commiter la clé OpenAI dans le code**
   - ✅ Utilisez toujours `supabase secrets`
   - ✅ Ne la mettez jamais dans `.env` (seulement pour dev local si nécessaire)

2. **Limiter les dépenses**
   - Configurez une limite mensuelle sur OpenAI
   - Exemple : 20$/mois

3. **Limiter l'accès à la fonction**
   - ✅ Déjà protégé : La fonction vérifie l'authentification Supabase
   - ✅ Seuls les utilisateurs connectés peuvent l'appeler

4. **Rotation des clés**
   - Changez la clé tous les 3-6 mois
   - Si compromission suspectée : révocation immédiate sur OpenAI

---

## 🚀 COMMANDES RÉCAPITULATIVES

### Installation complète (à faire une seule fois)

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
cd /Users/mariusguibert/Downloads/project
supabase link --project-ref ouelqflgypxbpkyaowfg

# 4. Configurer la clé OpenAI
supabase secrets set OPENAI_API_KEY=sk-proj-VOTRE_CLE

# 5. Déployer la fonction
supabase functions deploy generate-quote-ai

# 6. Vérifier
supabase functions list
```

---

## 🎨 COMMENT ÇA MARCHE DANS L'APP

### Interface Utilisateur

1. Page **Devis** → Bouton **"Créer avec IA"**
2. Modal s'ouvre avec 2 onglets :
   - 📝 **Description** : Saisir du texte
   - 📸 **Photos** : Uploader des images

3. L'utilisateur peut ajouter :
   - Description des travaux
   - Informations sur le client
   - Photos du chantier (optionnel)

4. Clic sur **"Générer le devis"**

### Traitement Backend

1. La requête est envoyée à l'Edge Function `generate-quote-ai`
2. La fonction récupère le **catalogue de tarifs** de l'entreprise depuis Supabase
3. Elle envoie tout à **OpenAI GPT-4o** avec un prompt optimisé
4. L'IA analyse et génère un devis structuré en JSON
5. Le devis est renvoyé au frontend et pré-remplit le formulaire

### Avantages

- ✅ **Gain de temps** : Devis en 5 secondes au lieu de 20 minutes
- ✅ **Cohérence** : Utilise vos tarifs du catalogue
- ✅ **Professionnel** : Descriptions claires et structurées
- ✅ **Vision IA** : Analyse les photos pour identifier les travaux
- ✅ **Personnalisé** : S'adapte à votre catalogue de services

---

## 📝 EXEMPLE DE PROMPT ENVOYÉ À L'IA

```
Tu es un assistant expert en création de devis pour le secteur du bâtiment.

📋 CATALOGUE DES TARIFS DE L'ENTREPRISE :
• Peinture murale intérieure: 15€ HT par m²
• Pose de carrelage sol: 45€ HT par m²
• Plomberie (installation douche): 850€ HT par forfait

⚠️ Si un service correspond, tu DOIS utiliser exactement ce prix.

Règles :
- Génère un devis détaillé
- Utilise EN PRIORITÉ les tarifs du catalogue
- Sois précis et professionnel

Demande client :
Je veux refaire ma salle de bain (12m²) : carrelage, douche, peinture
```

**Réponse de l'IA (JSON)** :
```json
{
  "title": "Rénovation Salle de Bain",
  "description": "Rénovation complète salle de bain 12m²",
  "items": [
    {
      "description": "Pose de carrelage sol",
      "quantity": 12,
      "unit": "m²",
      "unit_price": 45.00
    },
    {
      "description": "Installation douche italienne",
      "quantity": 1,
      "unit": "forfait",
      "unit_price": 850.00
    },
    {
      "description": "Peinture plafond et murs",
      "quantity": 40,
      "unit": "m²",
      "unit_price": 15.00
    }
  ],
  "notes": "Tarifs HT. TVA 10% applicable. Délai : 5 jours ouvrés."
}
```

---

## 🎯 ALTERNATIVE : Utiliser un modèle moins cher

Si vous voulez réduire les coûts, vous pouvez utiliser **GPT-4 Turbo** ou **GPT-3.5 Turbo** :

### Modifier le modèle

Éditez `/supabase/functions/generate-quote-ai/index.ts` :

```typescript
// Ligne 160 : Changer le modèle
model: 'gpt-4-turbo', // Au lieu de 'gpt-4o'
```

**⚠️ Limitation** : GPT-4 Turbo et GPT-3.5 n'ont **pas de vision**
- Vous perdrez la capacité d'analyser les photos
- Seule la génération par texte fonctionnera

**Coûts comparatifs** :
- GPT-4o : ~$0.004 par devis
- GPT-4 Turbo : ~$0.002 par devis
- GPT-3.5 Turbo : ~$0.0005 par devis

💡 **Recommandation** : Gardez GPT-4o, le coût est très faible pour la qualité apportée.

---

## 📊 ALTERNATIVE 2 : Utiliser Claude 3.5 Sonnet (Anthropic)

Si vous préférez **Anthropic Claude** (concurrent d'OpenAI) :

### Avantages de Claude
- Souvent moins cher
- Excellente qualité de génération
- Bonne compréhension du contexte
- Vision également disponible

### Modifications nécessaires

1. Créer un compte sur https://console.anthropic.com
2. Obtenir une clé API
3. Modifier la fonction pour utiliser l'API Anthropic
4. Déployer

**💬 Dites-moi si vous voulez que je modifie la fonction pour Claude !**

---

## 🎓 RESSOURCES OPENAI

- **Documentation API** : https://platform.openai.com/docs
- **Pricing** : https://openai.com/pricing
- **Usage** : https://platform.openai.com/usage
- **API Keys** : https://platform.openai.com/api-keys
- **Status** : https://status.openai.com

---

## ✅ CHECKLIST DE CONFIGURATION

Cochez au fur et à mesure :

- [ ] Compte OpenAI créé
- [ ] Carte bancaire ajoutée
- [ ] Limite de dépenses configurée (ex: 20$/mois)
- [ ] Clé API créée et copiée
- [ ] Supabase CLI installé (`supabase --version`)
- [ ] Login Supabase effectué (`supabase login`)
- [ ] Projet lié (`supabase link`)
- [ ] Secret configuré (`supabase secrets set OPENAI_API_KEY=...`)
- [ ] Fonction déployée (`supabase functions deploy generate-quote-ai`)
- [ ] Test réussi depuis l'interface
- [ ] Catalogue de tarifs rempli dans Paramètres

---

## 🎉 APRÈS LA CONFIGURATION

### Ce qui fonctionne

✅ Génération de devis en 5 secondes  
✅ Analyse de photos de chantier  
✅ Utilisation automatique de votre catalogue  
✅ Pré-remplissage du formulaire de devis  
✅ Score de confiance IA affiché  

### Ce que vous pouvez faire

1. **Enrichir votre catalogue de tarifs**
   - Plus vous avez de services configurés
   - Plus l'IA sera précise et cohérente

2. **Former vos équipes**
   - Montrez-leur le bouton "Créer avec IA"
   - Expliquez comment bien décrire les travaux

3. **Mesurer l'impact**
   - Temps gagné par devis
   - Taux de conversion
   - Satisfaction client

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** :
   ```bash
   supabase functions logs generate-quote-ai
   ```

2. **Testez votre clé OpenAI directement** :
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer sk-proj-VOTRE_CLE"
   ```

3. **Demandez-moi** : Décrivez l'erreur exacte que vous obtenez !

---

## 🚀 PROCHAINES AMÉLIORATIONS POSSIBLES

### Court terme
- Historique des devis générés par IA
- Note de satisfaction utilisateur sur les devis IA
- Ajustement manuel après génération

### Moyen terme
- Génération de factures avec IA
- Suggestions de prix basées sur l'historique
- Analyse de rentabilité par type de chantier

### Long terme
- Assistant vocal pour créer des devis
- Génération de contrats
- Prédiction de durée de chantier

---

## 💡 CONSEIL PRO

**Commencez petit** :
1. Configurez OpenAI avec une limite de 10$/mois
2. Testez avec vos 10 premiers devis
3. Analysez les résultats
4. Ajustez votre catalogue de tarifs
5. Augmentez la limite si satisfait

**L'IA apprend de vos tarifs** : Plus votre catalogue est complet, meilleure sera la qualité !

---

**Prêt à configurer ? Lancez-vous ! 🚀**
