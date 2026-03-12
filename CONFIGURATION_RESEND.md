# 📧 Configuration Resend - Guide Complet

Date : 7 mars 2026  
Objectif : Activer l'envoi d'emails pour les photos de chantier

---

## 🎯 CONTEXTE

**Resend** est le service d'envoi d'emails utilisé par Builty pour :
- 📸 Envoyer les photos de chantier aux clients
- 📧 (Futur) Invitations d'équipe
- 📧 (Futur) Notifications par email

### Coûts
- **Gratuit** : 100 emails/jour (3000/mois)
- **Payant** : 20$/mois pour 50 000 emails/mois

**Pour commencer, le plan gratuit est largement suffisant !**

---

## 📋 ÉTAPES DE CONFIGURATION (10 minutes)

### ÉTAPE 1 : Créer un compte Resend (2 min)

1. Allez sur : **https://resend.com/signup**

2. Créez un compte avec :
   - Votre email professionnel
   - Mot de passe sécurisé

3. Vérifiez votre email

4. Vous arrivez sur le Dashboard Resend

---

### ÉTAPE 2 : Obtenir votre clé API (1 min)

1. Dans le Dashboard Resend, allez sur **"API Keys"**
   - Ou directement : https://resend.com/api-keys

2. Cliquez sur **"Create API Key"**

3. Remplissez :
   - **Name** : `Builty Production` (ou `Builty Test` pour commencer)
   - **Permission** : `Full access` (ou seulement `Send emails`)
   - **Domain** : (laissez vide pour l'instant)

4. Cliquez sur **"Create"**

5. **⚠️ COPIEZ LA CLÉ IMMÉDIATEMENT** : `re_XXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Format : Commence par `re_`
   - Environ 40-50 caractères
   - **Vous ne pourrez plus la voir après !**

💡 **Sauvegardez-la** dans un endroit sécurisé (gestionnaire de mots de passe)

---

### ÉTAPE 3 : Configurer le domaine d'envoi

#### Option A : Utiliser le domaine de test (RAPIDE - pour commencer)

Resend vous donne un domaine de test par défaut :
- **Adresse d'envoi** : `onboarding@resend.dev`
- ✅ **Avantage** : Fonctionne immédiatement
- ⚠️ **Inconvénient** : Les emails peuvent tomber en spam

**Pour commencer les tests, utilisez cette option !**

---

#### Option B : Configurer votre propre domaine (RECOMMANDÉ pour production)

Si vous avez un domaine (ex: `builty.fr`) :

1. Dans Resend Dashboard, allez sur **"Domains"**

2. Cliquez sur **"Add Domain"**

3. Entrez votre domaine : `builty.fr`

4. Resend vous donne des **enregistrements DNS** à ajouter :
   ```
   Type: TXT
   Name: resend._domainkey
   Value: (longue clé fournie par Resend)
   
   Type: MX
   Name: @
   Value: mx.resend.com
   Priority: 10
   ```

5. Allez chez votre registraire de domaine (OVH, Gandi, Cloudflare, etc.)
   - Ajoutez ces enregistrements DNS
   - ⏱️ Attendez 5-10 minutes pour la propagation

6. Revenez sur Resend et cliquez sur **"Verify"**

7. ✅ Une fois vérifié, vous pouvez envoyer depuis `contact@builty.fr` ou `noreply@builty.fr`

**💡 Pour l'instant, passez à l'étape 4 avec le domaine de test, vous configurerez votre domaine plus tard !**

---

### ÉTAPE 4 : Configurer la clé dans Supabase (3 min)

#### 4.1 Prérequis

Assurez-vous que Supabase CLI est installé et configuré :

```bash
# Vérifier l'installation
supabase --version

# Si pas installé
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
cd /Users/mariusguibert/Downloads/project
supabase link --project-ref ouelqflgypxbpkyaowfg
```

---

#### 4.2 Configurer le secret

```bash
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE
```

**Exemple** :
```bash
supabase secrets set RESEND_API_KEY=re_123abc456def789ghi012jkl345mno678pqr
```

✅ Vous devriez voir : `Finished supabase secrets set.`

---

#### 4.3 Vérifier les secrets

```bash
supabase secrets list
```

Vous devriez voir :
```
RESEND_API_KEY
STRIPE_SECRET_KEY (si configuré)
OPENAI_API_KEY (si configuré)
```

---

### ÉTAPE 5 : Déployer la fonction Edge (2 min)

```bash
cd /Users/mariusguibert/Downloads/project
supabase functions deploy send-project-photos
```

**Ce qui se passe** :
1. Le CLI compile la fonction TypeScript
2. L'uploade sur Supabase
3. La rend disponible via URL

✅ **Succès si vous voyez** :
```
Deployed Function send-project-photos on project ouelqflgypxbpkyaowfg
URL: https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/send-project-photos
```

---

### ÉTAPE 6 : Tester l'envoi (2 min)

#### Via l'application

1. **Lancez votre application** :
   ```bash
   npm run dev
   ```

2. **Ouvrez l'app** : `http://localhost:5173`

3. **Connectez-vous** avec votre compte

4. **Allez sur un chantier** :
   - Menu **Chantiers**
   - Cliquez sur un chantier existant
   - Ou créez-en un nouveau

5. **Ajoutez un client au chantier** (si pas déjà fait) :
   - Le client doit avoir une adresse email

6. **Allez dans l'onglet "Photos du chantier"**

7. **Ajoutez une photo de test** :
   - Cliquez sur "Ajouter des photos"
   - Sélectionnez une image

8. **Envoyez la photo** :
   - Cochez la photo
   - Cliquez sur "Envoyer au client (1)"
   - Confirmez

9. **Vérifiez l'email** :
   - Ouvrez la boîte email du client
   - Vous devriez recevoir un **email magnifique** avec la photo !

---

## 🧪 TEST MANUEL (via cURL)

Pour tester la fonction directement sans passer par l'interface :

```bash
curl -X POST \
  https://ouelqflgypxbpkyaowfg.supabase.co/functions/v1/send-project-photos \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clientEmail": "test@example.com",
    "clientName": "Client Test",
    "projectName": "Test Chantier",
    "photos": [
      {
        "url": "https://via.placeholder.com/800x600",
        "fileName": "photo-test.jpg",
        "description": "Photo de test"
      }
    ]
  }'
```

**Remplacez** `VOTRE_ANON_KEY` par la clé dans `.env` :
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZWxxZmxneXB4YnBreWFvd2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjk0OTYsImV4cCI6MjA4MTgwNTQ5Nn0.2wBLuw0J4aVAv3fzI9b8pGwVtKJ3uxPX_ExefLCnaiA
```

✅ **Réponse attendue** :
```json
{
  "success": true,
  "messageId": "abc123-def456-ghi789"
}
```

---

## 🔍 DÉPANNAGE

### ❌ Erreur : "RESEND_API_KEY is not configured"

**Cause** : La clé n'est pas dans les secrets Supabase

**Solution** :
```bash
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE
supabase functions deploy send-project-photos
```

---

### ❌ Erreur : "Invalid API key"

**Cause** : La clé Resend est invalide ou mal copiée

**Solutions** :
1. Vérifiez que vous avez copié la clé en entier (commence par `re_`)
2. Créez une nouvelle clé sur https://resend.com/api-keys
3. Reconfigurez :
   ```bash
   supabase secrets set RESEND_API_KEY=nouvelle_clé
   supabase functions deploy send-project-photos
   ```

---

### ❌ Erreur : "From email is not verified"

**Cause** : Vous essayez d'envoyer depuis une adresse non vérifiée

**Solutions** :

**Option 1** (Temporaire - pour tester) :
- Utilisez `onboarding@resend.dev` comme adresse d'envoi
- Modifiez temporairement la ligne 153 de `send-project-photos/index.ts` :
  ```typescript
  from: 'onboarding@resend.dev',  // Au lieu de company?.email
  ```
- Redéployez : `supabase functions deploy send-project-photos`

**Option 2** (Définitif) :
- Configurez votre propre domaine (voir Étape 3, Option B)
- Une fois vérifié, utilisez `contact@votredomaine.fr`

---

### ❌ Erreur : "Function not found"

**Cause** : La fonction n'a pas été déployée

**Solution** :
```bash
cd /Users/mariusguibert/Downloads/project
supabase functions deploy send-project-photos
```

---

### ❌ Email envoyé mais pas reçu

**Causes possibles** :

1. **Email en spam** :
   - Vérifiez le dossier spam/courrier indésirable
   - Si vous utilisez `onboarding@resend.dev`, c'est normal

2. **Adresse email invalide** :
   - Vérifiez que le client a une adresse email valide dans la base de données

3. **Limite atteinte** :
   - Plan gratuit : 100 emails/jour
   - Vérifiez dans Resend Dashboard → "Logs"

---

### ❌ Les photos ne s'affichent pas dans l'email

**Cause** : Les URLs des photos ne sont pas publiques

**Solution** :
1. Vérifiez que le bucket `project-photos` est **public**
2. Dans Supabase Dashboard → Storage → `project-photos`
3. Settings → Public bucket : ✅ Activé

---

## 📊 MONITORING ET LOGS

### Voir les logs de la fonction

```bash
supabase functions logs send-project-photos --limit 50
```

**Ou** dans le Dashboard Supabase :
1. Menu **Edge Functions**
2. Cliquez sur `send-project-photos`
3. Onglet **Logs**

---

### Voir l'historique des emails envoyés

Dans Resend Dashboard :
1. Allez sur **"Emails"** (ou https://resend.com/emails)
2. Vous verrez tous les emails envoyés avec :
   - ✅ Statut (delivered, bounced, etc.)
   - 📧 Destinataire
   - 📅 Date/heure
   - 🔍 Détails (cliquez pour voir le contenu)

---

## 📧 PERSONNALISATION DES EMAILS

### Modifier le template d'email

Le template se trouve dans : `/Users/mariusguibert/Downloads/project/supabase/functions/send-project-photos/index.ts`

**Sections modifiables** :

1. **Header** (lignes 103-107) :
   ```typescript
   <div style="background: linear-gradient(135deg, #0D47A1 0%, #1976D2 100%); padding: 40px 30px; text-align: center;">
     <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
       Photos de votre chantier
     </h1>
   </div>
   ```

2. **Message d'introduction** (lignes 111-117) :
   ```typescript
   <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
     Bonjour ${clientName},
   </p>
   
   <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
     Nous vous transmettons ${photos.length} photo${photos.length > 1 ? 's' : ''} de l'avancement de votre chantier <strong>${projectName}</strong>.
   </p>
   ```

3. **Footer** (lignes 134-140) :
   ```typescript
   <p style="margin: 0; font-size: 12px; color: #9ca3af;">
     Email envoyé depuis Builty - Gestion de chantiers
   </p>
   ```

Après modification, **redéployez** :
```bash
supabase functions deploy send-project-photos
```

---

## 🎨 APERÇU DE L'EMAIL ENVOYÉ

```
┌─────────────────────────────────────────────┐
│                                              │
│   📧 Photos de votre chantier               │
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│   Bonjour Jean Dupont,                      │
│                                              │
│   Nous vous transmettons 3 photos de       │
│   l'avancement de votre chantier            │
│   Rénovation Salle de Bain.                 │
│                                              │
│   ┌───────────────────────────────────┐    │
│   │  [IMAGE 1]                        │    │
│   │  photo-1.jpg                      │    │
│   │  Vue d'ensemble                   │    │
│   └───────────────────────────────────┘    │
│                                              │
│   ┌───────────────────────────────────┐    │
│   │  [IMAGE 2]                        │    │
│   │  photo-2.jpg                      │    │
│   │  Détail carrelage                 │    │
│   └───────────────────────────────────┘    │
│                                              │
│   ┌───────────────────────────────────┐    │
│   │  [IMAGE 3]                        │    │
│   │  photo-3.jpg                      │    │
│   │  Installation douche              │    │
│   └───────────────────────────────────┘    │
│                                              │
│   ℹ️  Pour toute question :                 │
│   Votre Entreprise                          │
│   📧 contact@entreprise.fr                  │
│   📞 01 23 45 67 89                         │
│                                              │
├─────────────────────────────────────────────┤
│  Email envoyé depuis Builty                 │
└─────────────────────────────────────────────┘
```

**Design** :
- ✅ Responsive (mobile + desktop)
- ✅ Couleurs Builty (bleu gradient)
- ✅ Images en pleine largeur
- ✅ Informations de contact automatiques
- ✅ Fonctionne sur tous les clients mail (Gmail, Outlook, Apple Mail, etc.)

---

## 💰 TARIFICATION RESEND

### Plan Gratuit (Free)
- **0€/mois**
- 100 emails/jour (3000/mois)
- 1 domaine vérifié
- Support par email

**👉 Parfait pour commencer et tester !**

---

### Plan Pro
- **20$/mois** (~18€)
- 50 000 emails/mois
- Domaines illimités
- Webhooks (suivi des emails)
- Support prioritaire
- Analytics avancés

**👉 Quand vous passez à l'échelle**

---

### Estimation pour Builty

**Scénario** : 10 chantiers actifs, 5 photos envoyées par chantier/semaine

- **Emails/semaine** : 10 × 1 = 10 emails
- **Emails/mois** : ~40 emails
- **Coût** : **0€** (plan gratuit)

**Scénario** : 50 chantiers actifs, 10 photos par chantier/semaine

- **Emails/semaine** : 50 × 1 = 50 emails
- **Emails/mois** : ~200 emails
- **Coût** : **0€** (plan gratuit)

**Scénario** : 500 chantiers actifs

- **Emails/mois** : ~2000 emails
- **Coût** : **0€** (plan gratuit)

💡 **Conclusion** : Même avec une grosse utilisation, le plan gratuit suffit !

---

## 🔐 SÉCURITÉ

### ✅ Bonnes pratiques

1. **Ne jamais exposer la clé API**
   - ❌ Ne la mettez JAMAIS dans le code frontend
   - ❌ Ne la commitez JAMAIS dans Git
   - ✅ Utilisez toujours `supabase secrets`

2. **Rotation des clés**
   - Changez la clé tous les 6-12 mois
   - Si compromission : révocation immédiate sur Resend

3. **Limiter les permissions**
   - Créez une clé avec uniquement `Send emails` (pas `Full access`)

4. **Monitoring**
   - Surveillez le Dashboard Resend pour détecter toute activité suspecte

---

## 🎓 RESSOURCES RESEND

- **Documentation** : https://resend.com/docs
- **API Reference** : https://resend.com/docs/api-reference
- **Dashboard** : https://resend.com/dashboard
- **Support** : support@resend.com
- **Status** : https://status.resend.com

---

## 📋 COMMANDES RÉCAPITULATIVES

### Installation et configuration complète (10 min)

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
cd /Users/mariusguibert/Downloads/project
supabase link --project-ref ouelqflgypxbpkyaowfg

# 4. Configurer la clé Resend
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE

# 5. Déployer la fonction
supabase functions deploy send-project-photos

# 6. Vérifier
supabase secrets list
supabase functions list

# 7. Voir les logs
supabase functions logs send-project-photos
```

---

## ✅ CHECKLIST DE CONFIGURATION RESEND

- [ ] Compte Resend créé
- [ ] Clé API créée et copiée
- [ ] Domaine configuré (ou utilisation de `onboarding@resend.dev`)
- [ ] `RESEND_API_KEY` configuré dans Supabase
- [ ] Fonction `send-project-photos` déployée
- [ ] Bucket `project-photos` créé (public)
- [ ] Test d'envoi réussi depuis l'app
- [ ] Email reçu par le client test
- [ ] Email a un design professionnel ✅

---

## 🎁 CE QUI FONCTIONNE APRÈS CONFIGURATION

### Fonctionnalités activées

✅ **Galerie photos de chantier**
- Upload de photos multiples
- Sélection de photos
- Envoi groupé au client

✅ **Envoi d'emails automatique**
- Template professionnel avec couleurs Builty
- Images en haute résolution
- Informations de contact automatiques
- Responsive (mobile + desktop)

✅ **Suivi des envois**
- Dashboard Resend pour voir l'historique
- Statut de délivrance
- Logs détaillés

---

## 🚀 PROCHAINES ÉTAPES

Une fois Resend configuré, vous pouvez :

1. **Tester l'envoi de photos** depuis un chantier réel
2. **Personnaliser le template** d'email si besoin
3. **Configurer votre propre domaine** pour plus de professionnalisme
4. **Ajouter d'autres types d'emails** (invitations, notifications, etc.)

---

## 📞 BESOIN D'AIDE ?

### Commandes de diagnostic

```bash
# Voir les secrets
supabase secrets list

# Logs de la fonction
supabase functions logs send-project-photos --limit 50

# Status de Resend
curl -X GET https://api.resend.com/emails \
  -H "Authorization: Bearer re_VOTRE_CLE"
```

### Problème persistant ?

1. Vérifiez les logs de la fonction
2. Vérifiez le Dashboard Resend → Emails
3. Testez avec le domaine `onboarding@resend.dev`
4. Contactez le support Resend (très réactif !)

---

**Prêt à envoyer vos premières photos ? 🚀 Suivez les étapes et vous serez opérationnel en 10 minutes !**
