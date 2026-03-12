# Configuration de la fonctionnalité Photos de Chantier

Cette fonctionnalité permet d'ajouter des photos aux chantiers et de les envoyer par email aux clients.

## 📋 Étapes de configuration

### 1. Base de données Supabase

#### A. Exécuter la migration SQL

Dans le Dashboard Supabase :
1. Allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez le contenu de `supabase/migrations/create_project_photos.sql`
4. Exécutez la requête

#### B. Créer le bucket de stockage

Dans le Dashboard Supabase :
1. Allez dans **Storage**
2. Cliquez sur **New bucket**
3. Nom : `project-photos`
4. **Public bucket** : ✅ Activé
5. Cliquez sur **Create bucket**

#### C. Configurer les politiques de stockage

Pour le bucket `project-photos`, ajoutez ces politiques :

**Politique 1 : Accès public en lecture**
```sql
Policy name: Public Access
Allowed operation: SELECT
Policy definition: true
```

**Politique 2 : Upload pour utilisateurs authentifiés**
```sql
Policy name: Authenticated users can upload
Allowed operation: INSERT
Policy definition: auth.role() = 'authenticated'
```

**Politique 3 : Suppression par l'entreprise**
```sql
Policy name: Users can delete their company photos
Allowed operation: DELETE
Policy definition: (bucket_id = 'project-photos')
```

### 2. Configuration de l'envoi d'emails (Resend)

#### A. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine (ou utilisez le domaine de test)

#### B. Obtenir la clé API

1. Dans Resend Dashboard, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Copiez la clé générée

#### C. Déployer la fonction Edge

1. Installez Supabase CLI si nécessaire :
```bash
npm install -g supabase
```

2. Connectez-vous à votre projet :
```bash
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
```

3. Configurez les secrets :
```bash
supabase secrets set RESEND_API_KEY=votre_clé_api_resend
```

4. Déployez la fonction :
```bash
supabase functions deploy send-project-photos
```

### 3. Alternative : Configuration manuelle de la fonction Edge

Si vous préférez configurer manuellement dans le Dashboard Supabase :

1. Allez dans **Edge Functions**
2. Cliquez sur **New function**
3. Nom : `send-project-photos`
4. Copiez le contenu de `supabase/functions/send-project-photos/index.ts`
5. Dans **Settings** → **Secrets**, ajoutez :
   - `RESEND_API_KEY` avec votre clé API Resend

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Ouvrez un chantier dans l'application
2. Allez dans l'onglet **Photos du chantier**
3. Ajoutez une photo de test
4. Sélectionnez la photo
5. Cliquez sur **Envoyer au client**
6. Vérifiez que l'email est bien reçu

## 🎨 Fonctionnalités

- ✅ Upload de photos multiples
- ✅ Sélection de photos à envoyer
- ✅ Envoi par email avec design premium
- ✅ Galerie responsive avec design moderne
- ✅ Suppression de photos
- ✅ Sélection/Désélection de toutes les photos
- ✅ Récupération automatique de l'email client

## 📱 Usage

### Pour ajouter des photos :
1. Ouvrez un chantier
2. Cliquez sur l'onglet **Photos du chantier**
3. Cliquez sur **Ajouter des photos**
4. Sélectionnez une ou plusieurs photos

### Pour envoyer des photos au client :
1. Cochez les photos à envoyer
2. Cliquez sur **Envoyer au client (X)**
3. Confirmez l'envoi
4. Le client recevra un email avec toutes les photos sélectionnées

## 🔧 Dépannage

### Les photos ne s'affichent pas
- Vérifiez que le bucket `project-photos` est bien public
- Vérifiez les politiques RLS sur la table `project_photos`

### L'upload échoue
- Vérifiez que les politiques de stockage sont correctement configurées
- Vérifiez que l'utilisateur est authentifié

### L'envoi d'email échoue
- Vérifiez que la clé API Resend est correcte
- Vérifiez que la fonction Edge est bien déployée
- Vérifiez que le client a une adresse email dans la base de données
- Consultez les logs de la fonction Edge dans Supabase

## 📝 Notes

- Les photos sont stockées dans Supabase Storage
- L'envoi d'emails utilise Resend (gratuit jusqu'à 3000 emails/mois)
- Les photos sont automatiquement supprimées si le chantier est supprimé (CASCADE)
- Le format d'email est responsive et fonctionne sur tous les clients mail
