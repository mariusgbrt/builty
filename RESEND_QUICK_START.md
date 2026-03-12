# ⚡ RESEND - DÉMARRAGE RAPIDE (10 minutes)

Guide ultra-condensé pour configurer Resend rapidement.

---

## 🎯 PRÉREQUIS (2 min)

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

## 🚀 CONFIGURATION RAPIDE (8 min)

### 1️⃣ Créer un compte Resend (2 min)

👉 https://resend.com/signup

- Inscrivez-vous
- Vérifiez votre email

---

### 2️⃣ Obtenir la clé API (1 min)

👉 https://resend.com/api-keys → **"Create API Key"**

- Name : `Builty Production`
- Permission : `Full access`
- **📝 COPIEZ LA CLÉ** : `re_XXXXXXXXXX`

---

### 3️⃣ Configurer dans Supabase (2 min)

```bash
# Configurer la clé
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE

# Déployer la fonction
supabase functions deploy send-project-photos

# Vérifier
supabase secrets list
supabase functions list
```

---

### 4️⃣ Tester (3 min)

```bash
# 1. Lancer l'app
npm run dev

# 2. Ouvrir http://localhost:5173
# 3. Se connecter
# 4. Aller sur un chantier
# 5. Onglet "Photos du chantier"
# 6. Ajouter une photo
# 7. Sélectionner la photo
# 8. Cliquer "Envoyer au client"

# ✅ Le client reçoit l'email avec la photo !
```

---

## 📧 ADRESSE D'ENVOI

### Option A : Domaine de test (RAPIDE)

Utilisez : `onboarding@resend.dev`

✅ **Fonctionne immédiatement**  
⚠️ Peut tomber en spam

**Parfait pour tester !**

---

### Option B : Votre domaine (RECOMMANDÉ)

1. Resend Dashboard → **"Domains"** → **"Add Domain"**
2. Entrez : `builty.fr` (ou votre domaine)
3. Ajoutez les enregistrements DNS fournis
4. Attendez 5-10 minutes
5. Cliquez **"Verify"**

✅ **Envoi depuis** : `contact@builty.fr`

---

## ⚠️ EN CAS DE PROBLÈME

### Commandes de diagnostic

```bash
# Voir les secrets
supabase secrets list

# Logs de la fonction
supabase functions logs send-project-photos --limit 20

# Vérifier que la fonction est déployée
supabase functions list
```

### Email pas reçu ?

1. Vérifiez le dossier **spam**
2. Vérifiez que le **client a une adresse email** dans la base
3. Vérifiez les **logs** : `supabase functions logs send-project-photos`
4. Dashboard Resend → **"Emails"** pour voir l'historique

---

## 💰 TARIF

- **Gratuit** : 100 emails/jour (3000/mois)
- **Payant** : 20$/mois (50 000 emails/mois)

**Le gratuit suffit largement pour commencer !**

---

## 📋 CHECKLIST ULTRA-RAPIDE

- [ ] Compte Resend créé
- [ ] Clé API copiée (`re_XXXX`)
- [ ] `RESEND_API_KEY` configuré dans Supabase
- [ ] Fonction `send-project-photos` déployée
- [ ] Test d'envoi réussi
- [ ] Email reçu ✅

---

## 🎉 TEMPS ESTIMÉ

- ⏱️ **Première fois** : 10 minutes
- ⏱️ **Si compte Resend existant** : 5 minutes

**C'est parti ! 🚀**
