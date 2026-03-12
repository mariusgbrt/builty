# ⚡ STRIPE - DÉMARRAGE RAPIDE (15 minutes)

Guide ultra-condensé pour configurer Stripe rapidement.

---

## 🎯 PRÉREQUIS (5 min)

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
cd /Users/mariusguibert/Downloads/project
supabase link --project-ref ouelqflgypxbpkyaowfg
```

---

## 🚀 CONFIGURATION RAPIDE (10 min)

### 1️⃣ Créer un compte Stripe (2 min)

👉 https://dashboard.stripe.com/register

- Inscrivez-vous
- Vérifiez votre email
- Restez en **mode TEST**

---

### 2️⃣ Créer les 2 produits (3 min)

👉 https://dashboard.stripe.com/test/products → **"+ Créer un produit"**

#### Produit 1 : PRO
- Nom : `Builty PRO`
- Prix : `169` EUR
- Récurrent : `Mensuel`
- **📝 NOTEZ LE PRICE ID** : `price_XXXXXXXXXX`

#### Produit 2 : REGULAR
- Nom : `Builty REGULAR`
- Prix : `89` EUR
- Récurrent : `Mensuel`
- **📝 NOTEZ LE PRICE ID** : `price_YYYYYYYYYY`

---

### 3️⃣ Récupérer les clés API (1 min)

👉 https://dashboard.stripe.com/test/apikeys

**Copiez ces 2 clés** :
- **Secret key** : `sk_test_...` (longue clé)
- **Publishable key** : `pk_test_...` (longue clé)

---

### 4️⃣ Configurer Supabase (2 min)

```bash
# Configurer la clé secrète
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE

# Déployer les fonctions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

---

### 5️⃣ Créer le Webhook (2 min)

👉 https://dashboard.stripe.com/test/webhooks → **"+ Add endpoint"**

**Endpoint URL** :
```
https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/stripe-webhook
```

**Événements à sélectionner** (cliquez sur "Select events") :
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `payment_intent.succeeded`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`

**Cliquez sur "Add endpoint"**

**📝 COPIEZ LE SIGNING SECRET** : `whsec_XXXXXXXXXX`

Configurez-le :
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
supabase functions deploy stripe-webhook
```

---

### 6️⃣ Mettre à jour le code (1 min)

#### Fichier 1 : `src/stripe-config.ts`

Remplacez les IDs par vos vrais IDs :

```typescript
export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_VOTRE_ID_PRO',              // ← Votre vrai Product ID
    priceId: 'price_VOTRE_PRICE_ID_PRO',  // ← Votre vrai Price ID
    name: 'Builty PRO',
    description: 'Abonnement mensuel à Builty PRO',
    price: 169.00,
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 15,
      activeProjects: 8
    }
  },
  {
    id: 'prod_VOTRE_ID_REGULAR',
    priceId: 'price_VOTRE_PRICE_ID_REGULAR',
    name: 'Builty REGULAR',
    description: 'Abonnement mensuel à Builty REGULAR',
    price: 89.00,
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 8,
      activeProjects: 5
    }
  }
];
```

#### Fichier 2 : `.env`

Ajoutez la clé publique :

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
```

---

## 🧪 TEST RAPIDE (1 min)

```bash
# 1. Lancer l'app
npm run dev

# 2. Ouvrir http://localhost:5173
# 3. S'inscrire / Se connecter
# 4. Aller sur /subscription
# 5. Cliquer sur "S'abonner"
# 6. Carte de test : 4242 4242 4242 4242
# 7. MM/AA : 12/34, CVC : 123

# ✅ Si ça fonctionne : redirection vers /success
# ✅ Vérifier dans Stripe Dashboard → Paiements
# ✅ Vérifier dans Supabase → Table stripe_subscriptions
```

---

## ⚠️ EN CAS DE PROBLÈME

### Commandes de diagnostic

```bash
# Voir les secrets
supabase secrets list

# Logs stripe-checkout
supabase functions logs stripe-checkout --limit 20

# Logs stripe-webhook  
supabase functions logs stripe-webhook --limit 20

# Vérifier les tables Supabase
# → Supabase Dashboard → Table Editor → stripe_subscriptions
```

### Webhook ne fonctionne pas ?

1. https://dashboard.stripe.com/test/webhooks
2. Cliquez sur votre webhook
3. Onglet "Events"
4. Vérifiez que les événements sont **200 OK**
5. Si 4XX ou 5XX : regardez les logs (`supabase functions logs stripe-webhook`)

---

## 📋 CHECKLIST ULTRA-RAPIDE

- [ ] Compte Stripe créé
- [ ] 2 produits créés (PRO 169€, REGULAR 89€)
- [ ] IDs notés (Product ID et Price ID pour chaque)
- [ ] Clés API copiées (sk_test_ et pk_test_)
- [ ] `STRIPE_SECRET_KEY` configuré
- [ ] `stripe-checkout` déployé
- [ ] `stripe-webhook` déployé
- [ ] Webhook créé dans Stripe avec 7 événements
- [ ] Signing secret copié
- [ ] `STRIPE_WEBHOOK_SECRET` configuré
- [ ] `stripe-webhook` redéployé
- [ ] `stripe-config.ts` mis à jour
- [ ] `.env` mis à jour avec `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Test avec carte `4242 4242 4242 4242`
- [ ] Paiement réussi ✅

---

## 🎉 TEMPS ESTIMÉ

- ⏱️ **Première fois** : 30-45 minutes
- ⏱️ **Si vous avez déjà un compte Stripe** : 15 minutes
- ⏱️ **Passage en mode Live (plus tard)** : 10 minutes

**Vous êtes prêt ! 🚀**
