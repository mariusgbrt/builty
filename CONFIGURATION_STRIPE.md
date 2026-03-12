# 💳 Configuration Stripe - Guide Complet

Date : 7 mars 2026  
Objectif : Activer les paiements par abonnement pour Builty

---

## 🎯 CONTEXTE

Votre application Builty utilise **Stripe** pour :
- 💳 **Paiements sécurisés** des abonnements mensuels
- 🔄 **Gestion automatique** des renouvellements
- 📊 **Synchronisation** du statut d'abonnement avec Supabase
- ⚙️ **Webhooks** pour mettre à jour l'app en temps réel

### Plans tarifaires
- **REGULAR** : 89€/mois (jusqu'à 8 employés, 5 chantiers actifs)
- **PRO** : 169€/mois (jusqu'à 15 employés, 8 chantiers actifs)

---

## 📋 ÉTAPES DE CONFIGURATION

### ✅ PRÉREQUIS

Avant de commencer :
- [ ] Supabase CLI installé (`npm install -g supabase`)
- [ ] Connecté à Supabase (`supabase login`)
- [ ] Projet lié (`supabase link --project-ref ouelqflgypxbpkyaowfg`)
- [ ] Tables Stripe créées (migration `20251221142527_silent_snow.sql` exécutée)

Si pas encore fait, exécutez la migration :
```sql
-- Ouvrez Supabase Dashboard → SQL Editor
-- Copiez le contenu de supabase/migrations/20251221142527_silent_snow.sql
-- Exécutez
```

---

## ÉTAPE 1 : Créer un compte Stripe

### 1.1 Inscription

1. Allez sur : **https://dashboard.stripe.com/register**

2. Créez un compte avec :
   - Votre email professionnel (ex: `marius@builty.fr`)
   - Mot de passe sécurisé
   - Informations de votre entreprise

3. Vérifiez votre email

4. **Mode Test** : Par défaut, vous êtes en "Mode Test"
   - ✅ Parfait pour la configuration initiale
   - Utilisez des numéros de carte de test
   - Aucun vrai paiement

---

### 1.2 Compléter votre profil

1. **Informations d'entreprise**
   - Nom légal : "Votre Entreprise SAS" (ou autre)
   - Secteur : "Software" ou "SaaS"
   - Site web : `builty.fr` (si vous l'avez)

2. **Coordonnées bancaires** (pour recevoir les paiements)
   - ⚠️ **IMPORTANT** : Nécessaire pour passer en mode Live
   - IBAN de votre compte professionnel
   - Justificatifs d'identité (KYC)

3. **Activation du compte**
   - Stripe vérifiera vos informations (1-2 jours ouvrés)
   - Vous recevrez un email de confirmation

💡 **Conseil** : Vous pouvez commencer la configuration en mode Test pendant que Stripe vérifie votre compte !

---

## ÉTAPE 2 : Créer les produits et prix dans Stripe

### 2.1 Créer le plan REGULAR (89€/mois)

1. Allez sur : **https://dashboard.stripe.com/products**

2. Cliquez sur **"+ Créer un produit"** (ou "+ Add product")

3. Remplissez les informations :

   **Informations du produit** :
   - **Nom** : `Builty REGULAR`
   - **Description** : `Abonnement mensuel Builty REGULAR - Jusqu'à 8 employés et 5 chantiers actifs`
   - **Image** : (optionnel, uploadez le logo Builty)

   **Informations de prix** :
   - **Modèle de tarification** : `Tarification standard` (Standard pricing)
   - **Prix** : `89` EUR
   - **Facturation** : `Récurrente` (Recurring)
   - **Période de facturation** : `Mensuelle` (Monthly)
   - **Méthode de paiement** : `Carte bancaire` (Card)

4. Cliquez sur **"Enregistrer le produit"**

5. **⚠️ IMPORTANT** : Notez les IDs affichés :
   - **Product ID** : Format `prod_XXXXXXXXXXXXX`
   - **Price ID** : Format `price_XXXXXXXXXXXXXXXXXX`
   
   **Exemple** :
   ```
   Product ID: prod_RabcdefghijkL
   Price ID: price_1AbCdEfGhIjKlMnOpQrStUvW
   ```

---

### 2.2 Créer le plan PRO (169€/mois)

Répétez le processus :

1. Cliquez sur **"+ Créer un produit"**

2. Remplissez :
   - **Nom** : `Builty PRO`
   - **Description** : `Abonnement mensuel Builty PRO - Jusqu'à 15 employés et 8 chantiers actifs`
   - **Prix** : `169` EUR
   - **Facturation** : `Récurrente` → `Mensuelle`

3. Enregistrez et **notez les IDs** :
   ```
   Product ID: prod_YYYYYYYYYYYYYYYY
   Price ID: price_2XxXxXxXxXxXxXxXxXxXxXxXx
   ```

---

### 2.3 Vérifier vos produits

Dans https://dashboard.stripe.com/products, vous devriez voir :

```
┌──────────────────┬─────────┬────────────────┬──────────────────────────┐
│ Nom              │ Prix    │ Type           │ ID                       │
├──────────────────┼─────────┼────────────────┼──────────────────────────┤
│ Builty REGULAR   │ 89€     │ Mensuel        │ prod_XXXXXXXXXXXXXXX     │
│ Builty PRO       │ 169€    │ Mensuel        │ prod_YYYYYYYYYYYYYYY     │
└──────────────────┴─────────┴────────────────┴──────────────────────────┘
```

---

## ÉTAPE 3 : Obtenir vos clés API Stripe

### 3.1 Clés en mode Test (pour commencer)

1. Allez sur : **https://dashboard.stripe.com/test/apikeys**

2. Vous verrez 2 clés :
   - **Publishable key** (pk_test_...) : Clé publique, utilisée côté frontend
   - **Secret key** (sk_test_...) : Clé privée, utilisée côté backend

3. Cliquez sur **"Reveal test key"** pour voir la Secret Key

4. **⚠️ Copiez les deux clés** :
   ```
   Publishable key: pk_test_[VOTRE_CLE_PUBLIQUE]
   Secret key: sk_test_[VOTRE_CLE_SECRETE]
   ```

---

### 3.2 Clés en mode Live (pour production)

⚠️ **NE FAITES CECI QU'APRÈS avoir testé en mode Test !**

1. Activez votre compte Stripe (vérification bancaire complète)

2. Allez sur : **https://dashboard.stripe.com/apikeys**

3. Cliquez sur **"Reveal live key"**

4. Copiez les clés Live :
   ```
   Publishable key: pk_live_[VOTRE_CLE_PUBLIQUE_LIVE]
   Secret key: sk_live_[VOTRE_CLE_SECRETE_LIVE]
   ```

---

## ÉTAPE 4 : Configurer les secrets dans Supabase

### 4.1 Configurer STRIPE_SECRET_KEY

```bash
# En mode TEST (pour commencer)
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_TEST

# Plus tard, en mode LIVE (production)
supabase secrets set STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_LIVE
```

**Exemple** :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_[VOTRE_CLE_SECRETE_ICI]
```

✅ Vous devriez voir : `Finished supabase secrets set.`

---

### 4.2 Vérifier les secrets

```bash
supabase secrets list
```

Vous devriez voir :
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY` (si vous l'avez configuré)
- `RESEND_API_KEY` (si vous l'avez configuré)

---

## ÉTAPE 5 : Déployer les Edge Functions Stripe

### 5.1 Déployer stripe-checkout

```bash
cd /Users/mariusguibert/Downloads/project
supabase functions deploy stripe-checkout
```

**Cette fonction** :
- Crée une session de paiement Stripe
- Redirige l'utilisateur vers Stripe Checkout
- Gère la création du client Stripe

✅ **Succès si vous voyez** :
```
Deployed Function stripe-checkout on project ouelqflgypxbpkyaowfg
```

---

### 5.2 Déployer stripe-webhook

```bash
supabase functions deploy stripe-webhook
```

**Cette fonction** :
- Écoute les événements Stripe (paiements, renouvellements, annulations)
- Synchronise l'état de l'abonnement avec Supabase
- Met à jour les tables `stripe_subscriptions`

✅ **Succès si vous voyez** :
```
Deployed Function stripe-webhook on project ouelqflgypxbpkyaowfg
```

---

### 5.3 Vérifier les fonctions déployées

```bash
supabase functions list
```

Vous devriez voir :
- ✅ `stripe-checkout`
- ✅ `stripe-webhook`
- (et vos autres fonctions : `generate-quote-ai`, `send-project-photos`, etc.)

---

## ÉTAPE 6 : Configurer le Webhook Stripe ⚡

C'est **l'étape la plus critique** !

### 6.1 Obtenir l'URL de votre Edge Function

Votre webhook URL est :
```
https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/stripe-webhook
```

**⚠️ Copiez cette URL, vous en aurez besoin !**

---

### 6.2 Créer le Webhook Endpoint dans Stripe

#### En mode TEST (pour commencer)

1. Allez sur : **https://dashboard.stripe.com/test/webhooks**

2. Cliquez sur **"+ Add endpoint"** (ou "+ Ajouter un point de terminaison")

3. Remplissez :
   - **Endpoint URL** : `https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/stripe-webhook`
   - **Description** : `Builty Webhook - Test`

4. **Sélectionnez les événements à écouter** :
   
   Cliquez sur **"Select events"**, puis activez :
   
   ✅ **checkout.session.completed** (Le plus important)
   - Déclenché quand un paiement est confirmé
   
   ✅ **customer.subscription.created**
   - Nouveau abonnement créé
   
   ✅ **customer.subscription.updated**
   - Abonnement modifié (changement de plan, etc.)
   
   ✅ **customer.subscription.deleted**
   - Abonnement annulé ou expiré
   
   ✅ **payment_intent.succeeded**
   - Paiement réussi
   
   ✅ **invoice.paid**
   - Facture payée
   
   ✅ **invoice.payment_failed**
   - Échec de paiement

5. Cliquez sur **"Add endpoint"**

---

### 6.3 Récupérer le Webhook Secret

Après création du webhook, Stripe vous montre :

**Signing secret** : `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**⚠️ COPIEZ CE SECRET IMMÉDIATEMENT !**

---

### 6.4 Configurer STRIPE_WEBHOOK_SECRET dans Supabase

```bash
# En mode TEST
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_TEST

# Plus tard, en mode LIVE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_LIVE
```

**Exemple** :
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_EXEMPLE_SIGNING_SECRET
```

---

### 6.5 Redéployer stripe-webhook (important !)

Après avoir configuré le secret, **redéployez** la fonction :

```bash
supabase functions deploy stripe-webhook
```

💡 **Pourquoi ?** La fonction doit redémarrer pour charger le nouveau secret.

---

### 6.6 Répéter pour le mode LIVE (plus tard)

Quand vous passerez en production :

1. Allez sur : **https://dashboard.stripe.com/webhooks** (sans `/test/`)
2. Créez un nouveau webhook avec la **même URL**
3. Sélectionnez les **mêmes événements**
4. Récupérez le nouveau **Signing secret** (Live)
5. Configurez :
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_XXXX
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YYYY_live
   ```
6. Redéployez les fonctions

---

## ÉTAPE 7 : Mettre à jour les IDs de produits dans le code

### 7.1 Éditer stripe-config.ts

Ouvrez `/Users/mariusguibert/Downloads/project/src/stripe-config.ts`

**Remplacez** les anciens IDs par vos nouveaux IDs Stripe :

```typescript
export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_VOTRE_ID_PRO',              // ← Remplacez par votre Product ID PRO
    priceId: 'price_VOTRE_PRICE_ID_PRO',  // ← Remplacez par votre Price ID PRO
    name: 'Builty PRO',
    description: 'Abonnement mensuel à Builty PRO',
    price: 169.00,  // ← Prix mis à jour
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 15,
      activeProjects: 8
    }
  },
  {
    id: 'prod_VOTRE_ID_REGULAR',              // ← Remplacez par votre Product ID REGULAR
    priceId: 'price_VOTRE_PRICE_ID_REGULAR',  // ← Remplacez par votre Price ID REGULAR
    name: 'Builty REGULAR',
    description: 'Abonnement mensuel à Builty REGULAR',
    price: 89.00,  // ← Prix mis à jour
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 8,
      activeProjects: 5
    }
  }
];
```

---

### 7.2 Où trouver vos IDs Stripe

1. **Product ID** :
   - https://dashboard.stripe.com/test/products
   - Cliquez sur un produit
   - L'ID est en haut de la page : `prod_XXXXX`

2. **Price ID** :
   - Sur la même page, section "Pricing"
   - Cliquez sur le prix
   - L'ID est affiché : `price_XXXXX`

---

## ÉTAPE 8 : Tester le flux de paiement

### 8.1 Lancer l'application

```bash
cd /Users/mariusguibert/Downloads/project
npm run dev
```

---

### 8.2 Créer un compte de test

1. Ouvrez `http://localhost:5173`
2. Inscrivez-vous avec un email de test
3. Connectez-vous

---

### 8.3 Accéder à la page d'abonnement

1. Allez sur `/subscription` ou cliquez sur "S'abonner"
2. Vous devriez voir 2 cartes : **REGULAR** et **PRO**
3. Cliquez sur **"S'abonner"** sous un plan

---

### 8.4 Tester le paiement avec une carte de test

Stripe vous redirige vers une page de paiement.

**Utilisez une carte de test** :

#### Carte de succès ✅
```
Numéro : 4242 4242 4242 4242
MM/AA : 12/34 (n'importe quelle date future)
CVC : 123 (n'importe quel code)
Code postal : 12345 (n'importe lequel)
```

#### Carte de refus ❌ (pour tester les erreurs)
```
Numéro : 4000 0000 0000 0002
```

Plus de cartes de test : https://stripe.com/docs/testing

---

### 8.5 Vérifier le succès

1. **Stripe vous redirige** vers `/success` (sur votre app)

2. **Vérifier dans Stripe** :
   - Allez sur https://dashboard.stripe.com/test/payments
   - Vous devriez voir le paiement réussi

3. **Vérifier dans Supabase** :
   - Allez sur https://supabase.com/dashboard/project/ouelqflgypxbpkyaowfg
   - Menu **Table Editor** → Table `stripe_subscriptions`
   - Vous devriez voir une ligne avec `status: 'active'`

---

## ÉTAPE 9 : Tester le Webhook

### 9.1 Vérifier que le webhook a bien reçu l'événement

1. Allez sur : **https://dashboard.stripe.com/test/webhooks**

2. Cliquez sur votre webhook (celui que vous avez créé)

3. Allez dans l'onglet **"Events"** ou **"Événements"**

4. Vous devriez voir l'événement `checkout.session.completed` avec :
   - ✅ **200 OK** : Le webhook a bien fonctionné
   - ❌ **4XX ou 5XX** : Il y a une erreur (voir logs ci-dessous)

---

### 9.2 Voir les logs de la fonction

```bash
supabase functions logs stripe-webhook --limit 50
```

**Ce que vous devriez voir** :
```
Processing subscription checkout session
Starting subscription sync for customer: cus_XXXXX
Successfully synced subscription for customer: cus_XXXXX
```

---

### 9.3 Tester manuellement un événement

Vous pouvez envoyer un événement de test depuis Stripe :

1. https://dashboard.stripe.com/test/webhooks
2. Cliquez sur votre webhook
3. Cliquez sur **"Send test webhook"**
4. Choisissez `checkout.session.completed`
5. Cliquez sur **"Send test webhook"**

Vérifiez que la réponse est **200 OK**.

---

## ÉTAPE 10 : Mettre à jour le fichier .env (Frontend)

### 10.1 Ajouter la clé publique Stripe

Éditez `/Users/mariusguibert/Downloads/project/.env` :

```bash
VITE_SUPABASE_URL=https://ouelqflgypxbpkyaowfg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ajoutez cette ligne (en mode TEST pour commencer)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
```

**Exemple** :
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_EXEMPLE_CLE_PUBLIQUE_FRONT
```

---

### 10.2 Redémarrer le serveur de dev

```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez
npm run dev
```

---

## 🧪 TESTS COMPLETS

### Scénario 1 : Nouvel abonnement ✅

1. Créez un nouveau compte utilisateur
2. Allez sur `/subscription`
3. Cliquez sur "S'abonner" (plan REGULAR)
4. Utilisez la carte `4242 4242 4242 4242`
5. Complétez le paiement

**Attendu** :
- ✅ Redirection vers `/success`
- ✅ Entrée dans `stripe_customers` (table Supabase)
- ✅ Entrée dans `stripe_subscriptions` avec `status: 'active'`
- ✅ Événement `checkout.session.completed` dans Stripe Dashboard

---

### Scénario 2 : Changement de plan (Upgrade) 🚀

1. Allez sur **Paramètres → Abonnement**
2. Cliquez sur "Changer de plan"
3. Choisissez le plan PRO (169€)
4. Confirmez

**Attendu** :
- ✅ Mise à jour de `stripe_subscriptions.price_id`
- ✅ Événement `customer.subscription.updated` dans Stripe

---

### Scénario 3 : Annulation d'abonnement ❌

1. Allez dans **Paramètres → Abonnement**
2. Cliquez sur "Annuler l'abonnement"
3. Confirmez

**Attendu** :
- ✅ `cancel_at_period_end: true` dans Supabase
- ✅ L'utilisateur garde l'accès jusqu'à la fin de la période
- ✅ Événement `customer.subscription.updated` dans Stripe

---

### Scénario 4 : Paiement refusé 💳❌

1. Utilisez la carte `4000 0000 0000 0002`
2. Le paiement échoue

**Attendu** :
- ❌ Message d'erreur Stripe
- ❌ Pas de création d'abonnement

---

## 🔍 DÉPANNAGE

### ❌ Erreur : "STRIPE_SECRET_KEY is not configured"

**Cause** : La clé n'est pas dans les secrets Supabase

**Solution** :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_XXXX
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

---

### ❌ Erreur : "Invalid API Key provided"

**Cause** : La clé Stripe est invalide ou mal copiée

**Solutions** :
1. Vérifiez que vous utilisez bien `sk_test_` (mode test) ou `sk_live_` (mode live)
2. Régénérez une nouvelle clé sur https://dashboard.stripe.com/test/apikeys
3. Reconfigurez :
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=nouvelle_clé
   supabase functions deploy stripe-checkout
   ```

---

### ❌ Erreur : "No such price: price_XXXXX"

**Cause** : Les IDs dans `stripe-config.ts` ne correspondent pas à vos vrais produits Stripe

**Solution** :
1. Vérifiez vos IDs sur https://dashboard.stripe.com/test/products
2. Mettez à jour `src/stripe-config.ts` avec les bons IDs
3. Redémarrez le serveur (`npm run dev`)

---

### ❌ Webhook retourne 400 ou 401

**Cause** : Le webhook secret est invalide

**Solution** :
1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez sur votre webhook
3. Section **"Signing secret"** → Cliquez sur "Reveal"
4. Copiez le secret (`whsec_XXXX`)
5. Reconfigurez :
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXX
   supabase functions deploy stripe-webhook
   ```

---

### ❌ Le statut d'abonnement ne se met pas à jour

**Cause** : Le webhook n'est pas correctement configuré

**Solutions** :
1. **Vérifier les logs de la fonction** :
   ```bash
   supabase functions logs stripe-webhook --limit 50
   ```

2. **Vérifier dans Stripe** :
   - https://dashboard.stripe.com/test/webhooks
   - Cliquez sur votre webhook
   - Onglet "Events" → Vérifiez que les événements sont **200 OK**

3. **Tester manuellement** :
   - Cliquez sur "Send test webhook"
   - Choisissez `checkout.session.completed`
   - Vérifiez la réponse

4. **Vérifier les tables Supabase** :
   ```sql
   SELECT * FROM stripe_customers WHERE user_id = auth.uid();
   SELECT * FROM stripe_subscriptions;
   ```

---

### ❌ "Could not find table 'stripe_customers'"

**Cause** : La migration Stripe n'a pas été exécutée

**Solution** :
1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Copiez le contenu de `supabase/migrations/20251221142527_silent_snow.sql`
3. Exécutez la requête SQL
4. Vérifiez que les 3 tables sont créées :
   - `stripe_customers`
   - `stripe_subscriptions`
   - `stripe_orders`

---

## 🔐 SÉCURITÉ

### ✅ Bonnes pratiques

1. **Ne jamais exposer les clés secrètes**
   - ❌ Ne les mettez JAMAIS dans le code frontend
   - ❌ Ne les commitez JAMAIS dans Git
   - ✅ Utilisez toujours `supabase secrets` pour le backend
   - ✅ Utilisez `.env` pour les clés publiques uniquement

2. **Utiliser le mode Test avant Live**
   - Testez tous les scénarios en mode Test
   - Vérifiez que les webhooks fonctionnent
   - Seulement après : passez en Live

3. **Vérifier les signatures de webhook**
   - ✅ Déjà implémenté dans le code
   - Empêche les requêtes frauduleuses

4. **RLS activé sur les tables Stripe**
   - ✅ Déjà configuré
   - Les utilisateurs ne voient que leurs propres données

---

## 💰 TARIFICATION STRIPE

### Frais par transaction

**En Europe (France)** :
- **Cartes européennes** : 1,5% + 0,25€ par transaction réussie
- **Cartes non-européennes** : 2,9% + 0,25€

**Pour Builty** :
- Plan REGULAR (89€) → Frais : ~1,59€ (vous recevez : 87,41€)
- Plan PRO (169€) → Frais : ~2,79€ (vous recevez : 166,21€)

### Frais supplémentaires

- **Aucun frais mensuel** : Vous payez uniquement par transaction
- **Aucun frais d'installation** : Gratuit
- **Remboursements** : 0,25€ par remboursement

---

## 🎨 PERSONNALISATION STRIPE CHECKOUT

### Ajouter votre logo

1. Allez sur : **https://dashboard.stripe.com/settings/branding**
2. Uploadez le logo Builty
3. Configurez les couleurs de marque (bleu Builty : `#2563eb`)
4. Stripe utilisera automatiquement votre branding sur les pages de paiement

### Configurer les emails Stripe

1. **Reçus de paiement** : Envoyés automatiquement
2. **Factures** : Envoyées automatiquement chaque mois
3. **Échecs de paiement** : Notifications automatiques

Personnalisez les emails sur :
- https://dashboard.stripe.com/settings/emails

---

## 📊 DASHBOARD ET MONITORING

### Voir vos paiements

- **Mode Test** : https://dashboard.stripe.com/test/payments
- **Mode Live** : https://dashboard.stripe.com/payments

### Voir vos abonnements

- **Mode Test** : https://dashboard.stripe.com/test/subscriptions
- **Mode Live** : https://dashboard.stripe.com/subscriptions

### Voir vos clients

- **Mode Test** : https://dashboard.stripe.com/test/customers
- **Mode Live** : https://dashboard.stripe.com/customers

### Analytics

Stripe vous donne automatiquement :
- 📊 Chiffre d'affaires mensuel
- 📈 Taux de croissance (MRR)
- 💳 Taux d'échec de paiement
- 🔄 Taux de churn (annulations)

---

## 🚨 GESTION DES ÉCHECS DE PAIEMENT

### Ce qui se passe automatiquement

1. **Jour J** : Échec du renouvellement
   - Stripe réessaie automatiquement
   - Email envoyé au client

2. **J+3** : Nouvelle tentative automatique

3. **J+7** : Nouvelle tentative automatique

4. **J+15** : Abonnement marqué comme `past_due`
   - Le client perd l'accès (à implémenter dans votre app)

5. **J+30** : Abonnement annulé définitivement
   - Événement `customer.subscription.deleted` envoyé au webhook

### Dans votre app (à implémenter)

Actuellement, le statut est synchronisé mais **pas vérifié** dans l'interface.

**Prochaine amélioration recommandée** :
- Bloquer l'accès si `subscription_status !== 'active'`
- Afficher un bandeau "Votre paiement a échoué"
- Rediriger vers une page de mise à jour du moyen de paiement

---

## 🔄 PASSAGE EN MODE LIVE (PRODUCTION)

### Checklist avant le passage en Live

- [ ] Compte Stripe **activé** (vérification bancaire terminée)
- [ ] Tous les tests réussis en mode Test
- [ ] Webhooks fonctionnels en Test
- [ ] Logo et branding configurés
- [ ] Application déployée sur un vrai domaine (ex: `app.builty.fr`)

---

### Étapes pour passer en Live

#### 1. Activer le mode Live sur Stripe

1. Allez sur : **https://dashboard.stripe.com/settings**
2. Section **"Activer votre compte"**
3. Complétez toutes les informations requises
4. Attendez la validation (1-2 jours)

---

#### 2. Créer les produits en mode Live

⚠️ **Les produits Test ne sont PAS copiés en Live**

1. **Passez en mode Live** dans Stripe Dashboard (toggle en haut à droite)
2. Recréez les 2 produits (REGULAR 89€, PRO 169€) **exactement comme en Test**
3. **Notez les nouveaux IDs Live** :
   ```
   Product PRO: prod_LiveXXXXXXXXXXXX
   Price PRO: price_LiveYYYYYYYYYYYY
   
   Product REGULAR: prod_LiveZZZZZZZZZZZZ
   Price REGULAR: price_LiveWWWWWWWWWWWW
   ```

---

#### 3. Créer le webhook en mode Live

1. Allez sur : **https://dashboard.stripe.com/webhooks** (sans `/test/`)
2. Créez un nouveau webhook avec **la même URL** :
   ```
   https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/stripe-webhook
   ```
3. Sélectionnez les **mêmes événements**
4. **Copiez le nouveau Signing secret** (Live) : `whsec_XXXXX_live`

---

#### 4. Configurer les secrets Live dans Supabase

```bash
# Clé secrète Live
supabase secrets set STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_LIVE

# Webhook secret Live
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_LIVE

# Redéployer les fonctions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

---

#### 5. Mettre à jour le code avec les IDs Live

Éditez `src/stripe-config.ts` avec les **nouveaux IDs Live** :

```typescript
export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_LiveXXXXXXXXXXXX',        // ← ID Live
    priceId: 'price_LiveYYYYYYYYYYYY',  // ← Price ID Live
    name: 'Builty PRO',
    price: 169.00,
    // ...
  },
  {
    id: 'prod_LiveZZZZZZZZZZZZ',        // ← ID Live
    priceId: 'price_LiveWWWWWWWWWWWW',  // ← Price ID Live
    name: 'Builty REGULAR',
    price: 89.00,
    // ...
  }
];
```

---

#### 6. Mettre à jour .env pour production

Sur Vercel (ou votre hébergeur) :

```bash
VITE_SUPABASE_URL=https://ouelqflgypxbpkyaowfg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_LIVE  # ← Clé Live
```

---

#### 7. Tester en production

1. Allez sur votre domaine de production (ex: `app.builty.fr`)
2. Créez un compte réel
3. Testez un abonnement **avec une vraie carte**
4. ⚠️ **ATTENTION** : Ce sera un vrai paiement !

💡 **Astuce** : Créez d'abord un abonnement pour vous-même à 1€ pour tester, puis annulez-le.

---

## 🎓 RESSOURCES STRIPE

- **Documentation API** : https://stripe.com/docs/api
- **Webhooks** : https://stripe.com/docs/webhooks
- **Cartes de test** : https://stripe.com/docs/testing
- **Dashboard** : https://dashboard.stripe.com
- **Support** : support@stripe.com (ou chat dans le dashboard)
- **Status** : https://status.stripe.com

---

## 📋 COMMANDES RÉCAPITULATIVES

### Installation et configuration complète

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
cd /Users/mariusguibert/Downloads/project
supabase link --project-ref ouelqflgypxbpkyaowfg

# 4. Configurer les secrets Stripe (MODE TEST)
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET

# 5. Déployer les fonctions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook

# 6. Vérifier
supabase secrets list
supabase functions list

# 7. Voir les logs
supabase functions logs stripe-webhook
```

---

## ✅ CHECKLIST DE CONFIGURATION STRIPE

### Mode TEST (faire en premier)

- [ ] Compte Stripe créé
- [ ] 2 produits créés (REGULAR 89€, PRO 169€)
- [ ] Product IDs et Price IDs notés
- [ ] Clés API Test récupérées (pk_test_ et sk_test_)
- [ ] `STRIPE_SECRET_KEY` configuré dans Supabase
- [ ] `stripe-checkout` déployé
- [ ] `stripe-webhook` déployé
- [ ] Webhook créé sur Stripe (https://dashboard.stripe.com/test/webhooks)
- [ ] 7 événements sélectionnés (checkout.session.completed, etc.)
- [ ] Webhook signing secret récupéré
- [ ] `STRIPE_WEBHOOK_SECRET` configuré dans Supabase
- [ ] `stripe-webhook` redéployé
- [ ] `stripe-config.ts` mis à jour avec les bons IDs
- [ ] `.env` mis à jour avec `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Test de paiement avec carte `4242 4242 4242 4242`
- [ ] Abonnement créé avec succès
- [ ] Webhook a reçu l'événement (200 OK)
- [ ] Table `stripe_subscriptions` mise à jour dans Supabase

---

### Mode LIVE (faire après les tests)

- [ ] Compte Stripe activé (vérification bancaire OK)
- [ ] Basculer sur mode Live dans Stripe Dashboard
- [ ] 2 produits recréés en mode Live (mêmes infos)
- [ ] Nouveaux Product IDs et Price IDs Live notés
- [ ] Clés API Live récupérées (pk_live_ et sk_live_)
- [ ] `STRIPE_SECRET_KEY` mis à jour (Live)
- [ ] Webhook Live créé (https://dashboard.stripe.com/webhooks)
- [ ] Nouveau signing secret Live récupéré
- [ ] `STRIPE_WEBHOOK_SECRET` mis à jour (Live)
- [ ] Fonctions redéployées
- [ ] `stripe-config.ts` mis à jour avec IDs Live
- [ ] Variables d'environnement production mises à jour
- [ ] Test de paiement réel
- [ ] Monitoring actif

---

## 🎁 CE QUI FONCTIONNE APRÈS CONFIGURATION

### Fonctionnalités activées

✅ **Page d'abonnement** (`/subscription`)
- 2 cartes de plans (REGULAR et PRO)
- Prix mis à jour (89€ et 169€)
- Limites affichées (employés, chantiers)

✅ **Flux de paiement sécurisé**
- Redirection vers Stripe Checkout
- Page de paiement aux couleurs Builty
- Retour automatique après paiement

✅ **Synchronisation automatique**
- Statut d'abonnement mis à jour en temps réel
- Visible dans Paramètres → Abonnement
- Gestion du cycle de vie complet

✅ **Gestion de l'abonnement**
- Voir le plan actuel
- Changer de plan
- Annuler l'abonnement
- Voir la date de renouvellement

---

## 🧪 CARTES DE TEST STRIPE

### Cartes de succès ✅

```
Visa : 4242 4242 4242 4242
Mastercard : 5555 5555 5555 4444
American Express : 3782 822463 10005
```

### Cartes d'échec ❌

```
Carte refusée : 4000 0000 0000 0002
Fonds insuffisants : 4000 0000 0000 9995
Carte expirée : 4000 0000 0000 0069
CVC incorrect : 4000 0000 0000 0127
```

### 3D Secure (authentification forte)

```
Authentification réussie : 4000 0027 6000 3184
Authentification échouée : 4000 0000 0000 3220
```

Plus de cartes : https://stripe.com/docs/testing

---

## 📧 EMAILS AUTOMATIQUES STRIPE

Stripe envoie automatiquement :

### Aux clients
- ✅ **Reçu de paiement** après chaque transaction
- ✅ **Facture mensuelle** pour les abonnements
- ✅ **Échec de paiement** si problème de carte
- ✅ **Abonnement annulé** si résiliation
- ✅ **Renouvellement à venir** (3 jours avant)

### À vous (admin)
- 📊 **Résumé hebdomadaire** des paiements
- ⚠️ **Alertes** en cas de problème
- 💰 **Virements** effectués sur votre compte

---

## 🔧 FONCTIONNALITÉS AVANCÉES (Optionnel)

### 1. Codes promo / Coupons

Pour créer un code promo :
1. https://dashboard.stripe.com/test/coupons
2. Créer un coupon (ex: `-20%` ou `-10€`)
3. L'appliquer dans le code :

```typescript
const session = await stripe.checkout.sessions.create({
  // ...
  discounts: [{
    coupon: 'PROMO20', // Code du coupon
  }],
});
```

---

### 2. Essai gratuit de 14 jours

Pour ajouter un essai gratuit :

1. Modifiez vos prix dans Stripe :
   - https://dashboard.stripe.com/test/products
   - Éditez chaque prix
   - Section "Free trial" → **14 days**

2. Le code gère déjà automatiquement les trials !

---

### 3. Taxe (TVA)

Si vous devez collecter la TVA :

1. https://dashboard.stripe.com/settings/tax
2. Activez **Stripe Tax**
3. Configurez les taux de TVA par pays

Le code doit être modifié pour inclure :
```typescript
automatic_tax: { enabled: true },
```

---

### 4. Factures personnalisées

Personnalisez vos factures :
1. https://dashboard.stripe.com/settings/billing/invoice
2. Ajoutez votre logo
3. Message de pied de page
4. Conditions de paiement

---

## 🎯 ARCHITECTURE TECHNIQUE

### Flux de paiement

```
[User clique "S'abonner"]
         ↓
[Frontend appelle stripe-checkout]
         ↓
[Edge Function crée une Stripe Session]
         ↓
[Redirection vers Stripe Checkout]
         ↓
[User paie avec sa carte]
         ↓
[Stripe envoie webhook → stripe-webhook]
         ↓
[Edge Function met à jour Supabase]
         ↓
[Table stripe_subscriptions.status = 'active']
         ↓
[User redirigé vers /success]
```

### Tables utilisées

```
stripe_customers
├── user_id (FK → auth.users)
└── customer_id (Stripe Customer ID)

stripe_subscriptions
├── customer_id (FK → stripe_customers)
├── subscription_id (Stripe Subscription ID)
├── price_id (Stripe Price ID)
├── status ('active', 'past_due', 'canceled', etc.)
├── current_period_start
└── current_period_end

stripe_orders (pour paiements uniques)
├── customer_id
├── payment_intent_id
└── amount_total
```

### Vue SQL simplifiée

```sql
CREATE VIEW stripe_user_subscriptions AS
SELECT
  c.customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_end
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid();
```

---

## 📝 EXEMPLE DE DONNÉES APRÈS UN ABONNEMENT

### Dans stripe_customers
```sql
┌────┬──────────────────────────────────┬─────────────────┬────────────┐
│ id │ user_id                          │ customer_id     │ created_at │
├────┼──────────────────────────────────┼─────────────────┼────────────┤
│ 1  │ a1b2c3d4-e5f6-7890-abcd-ef123456 │ cus_XXXXXXXXXX  │ 2026-03-07 │
└────┴──────────────────────────────────┴─────────────────┴────────────┘
```

### Dans stripe_subscriptions
```sql
┌────┬─────────────────┬──────────────────┬────────────────────────┬──────────┐
│ id │ customer_id     │ subscription_id  │ price_id               │ status   │
├────┼─────────────────┼──────────────────┼────────────────────────┼──────────┤
│ 1  │ cus_XXXXXXXXXX  │ sub_YYYYYYYYYY   │ price_1AbCdEfGhIjKlMnO │ active   │
└────┴─────────────────┴──────────────────┴────────────────────────┴──────────┘
```

---

## 🚀 AMÉLIORATIONS FUTURES

### Fonctionnalités à implémenter

1. **Gestion des limites de plan**
   - Bloquer la création de chantier si limite atteinte
   - Bloquer l'invitation d'employés si limite atteinte
   - Afficher un message "Passez au plan PRO"

2. **Portail client Stripe**
   - Permet aux users de gérer leur abonnement eux-mêmes
   - Mettre à jour la carte bancaire
   - Voir l'historique des factures
   - Télécharger les reçus

3. **Bannière de statut d'abonnement**
   - "Votre essai gratuit se termine dans X jours"
   - "Votre paiement a échoué"
   - "Votre abonnement a été annulé"

4. **Tableau de bord admin**
   - Vue de tous les abonnements actifs
   - Chiffre d'affaires mensuel (MRR)
   - Taux de churn

---

## 💡 CONSEILS PRO

### Pendant les tests

1. **Utilisez des emails différents** pour chaque test
   - test1@example.com
   - test2@example.com
   - etc.

2. **Nettoyez régulièrement** les données de test
   - Stripe Dashboard → Customers → Supprimer
   - Supabase → Tables Stripe → Vider

3. **Testez tous les scénarios** :
   - ✅ Nouveau client
   - ✅ Upgrade (REGULAR → PRO)
   - ✅ Downgrade (PRO → REGULAR)
   - ✅ Annulation
   - ✅ Échec de paiement
   - ✅ Renouvellement automatique

---

### En production

1. **Surveillez le Dashboard Stripe quotidiennement** (les premiers jours)
2. **Activez les alertes email** pour les échecs de paiement
3. **Mettez à jour vos clés API tous les 6-12 mois** (sécurité)
4. **Sauvegardez vos secrets** dans un gestionnaire de mots de passe

---

## ⚠️ ERREURS FRÉQUENTES

### "No such customer: cus_XXXXX"

**Cause** : Désynchronisation entre Supabase et Stripe

**Solution** :
1. Allez sur https://dashboard.stripe.com/test/customers
2. Trouvez le customer ID
3. Vérifiez qu'il existe dans `stripe_customers` (Supabase)

---

### "This customer has no attached payment source"

**Cause** : Le client n'a pas enregistré de carte

**Solution** :
- Normal en mode subscription : La carte est enregistrée via Checkout
- Vérifiez que le webhook `checkout.session.completed` a bien été traité

---

### "Unable to create subscription"

**Cause** : Problème de synchronisation

**Solutions** :
1. Vérifiez les logs :
   ```bash
   supabase functions logs stripe-checkout
   ```
2. Vérifiez que la table `stripe_subscriptions` existe
3. Vérifiez les RLS policies

---

## 🎉 RÉSUMÉ - CE QUE VOUS ALLEZ AVOIR

### Pour vos clients

✅ Processus de paiement **ultra-sécurisé**  
✅ Page de paiement **professionnelle** (branding Builty)  
✅ **Reçus automatiques** par email  
✅ **Factures mensuelles** générées automatiquement  
✅ Changement de plan **en 2 clics**  
✅ Annulation **sans friction**  

### Pour vous (admin)

✅ **Dashboard Stripe** avec analytics en temps réel  
✅ **Synchronisation automatique** avec votre app  
✅ **Webhooks** pour tout automatiser  
✅ **Exports** comptables (pour votre expert-comptable)  
✅ **Support Stripe** 24/7 en cas de problème  
✅ **Virements automatiques** sur votre compte (J+7)  

---

## 🚨 ATTENTION : MODE TEST vs LIVE

### Mode TEST (développement)

- ✅ Utilisez `sk_test_` et `pk_test_`
- ✅ Utilisez les cartes de test Stripe
- ✅ Aucun vrai paiement
- ✅ Webhook URL : **la même** qu'en Live

### Mode LIVE (production)

- ⚠️ Utilisez `sk_live_` et `pk_live_`
- ⚠️ Vrais paiements, vrais virements
- ⚠️ Recréez les produits (Test ≠ Live)
- ⚠️ Recréez le webhook (Test ≠ Live)

**Ne mélangez JAMAIS les clés Test et Live !**

---

## 💼 INFORMATIONS LÉGALES

### Obligations légales en France

1. **CGV** (Conditions Générales de Vente)
   - ✅ Déjà créées dans votre app (`/cgv`)
   - Mentionnez Stripe comme processeur de paiement

2. **Politique de remboursement**
   - Ajoutez-la dans vos CGV
   - Recommandation : 14 jours de rétractation

3. **Facturation**
   - ✅ Stripe génère les factures automatiquement
   - Conformes aux normes françaises

4. **TVA**
   - Si vous êtes assujetti : Activez Stripe Tax
   - Sinon : Pas de TVA à collecter (franchise en base)

---

## 📞 BESOIN D'AIDE ?

### Support Stripe

- **Chat** : Dans le Dashboard Stripe (bulle en bas à droite)
- **Email** : support@stripe.com
- **Documentation** : https://stripe.com/docs
- **Statut** : https://status.stripe.com

### Commandes de diagnostic

```bash
# Voir les secrets configurés
supabase secrets list

# Voir les fonctions déployées
supabase functions list

# Logs stripe-checkout
supabase functions logs stripe-checkout --limit 50

# Logs stripe-webhook
supabase functions logs stripe-webhook --limit 50

# Tester l'accès à Stripe depuis la fonction
supabase functions invoke stripe-checkout --body '{"test": true}'
```

---

## 🎓 RESSOURCES COMPLÉMENTAIRES

### Documentation Stripe + Supabase

- **Guide officiel** : https://supabase.com/docs/guides/functions/examples/stripe-webhooks
- **Exemple complet** : https://github.com/supabase/supabase/tree/master/examples/edge-functions/supabase/functions/stripe-webhook

### Vidéos tutoriels

- **Stripe Checkout** : https://www.youtube.com/watch?v=1r-F3FIONl8
- **Webhooks expliqués** : https://www.youtube.com/watch?v=oYelfBm07FI

---

## ✨ APRÈS LA CONFIGURATION

Vous aurez une **solution de paiement professionnelle** :

- 🔐 **Sécurité** : PCI-DSS compliant (géré par Stripe)
- 💳 **Multi-devises** : Possibilité d'ajouter USD, GBP, etc.
- 📊 **Analytics** : Suivi du chiffre d'affaires en temps réel
- 🔄 **Automatisation** : Renouvellements sans intervention
- 📧 **Communication** : Emails automatiques aux clients
- 🏦 **Comptabilité** : Exports pour votre expert-comptable

**Prêt à lancer ? 🚀 Suivez les étapes une par une et vous serez opérationnel en 30-45 minutes !**

---

## 📌 RÉCAPITULATIF DES URLs IMPORTANTES

```
Stripe Dashboard (Test) : https://dashboard.stripe.com/test
Stripe Dashboard (Live) : https://dashboard.stripe.com

Produits : /products
Paiements : /payments
Abonnements : /subscriptions
Webhooks : /webhooks
API Keys : /apikeys
Paramètres : /settings

Votre Webhook URL (ne change jamais) :
https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/stripe-webhook
```

---

**Commencez par le MODE TEST et dites-moi quand vous êtes prêt pour chaque étape ! 🎯**
