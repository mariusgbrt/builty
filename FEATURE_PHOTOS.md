# 📸 Fonctionnalité : Galerie Photos de Chantier

## Vue d'ensemble

Cette fonctionnalité premium permet de suivre visuellement l'avancement des chantiers en ajoutant des photos et de les partager facilement avec les clients par email.

## ✨ Fonctionnalités

### 1. Galerie Photos
- **Upload multiple** : Ajoutez plusieurs photos en une seule fois
- **Design premium** : Galerie responsive avec cards modernes
- **Métadonnées** : Chaque photo affiche son nom et sa date d'ajout
- **Suppression facile** : Bouton de suppression au survol

### 2. Sélection de Photos
- **Sélection individuelle** : Cliquez sur une photo pour la sélectionner
- **Sélection multiple** : Checkbox sur chaque photo
- **Tout sélectionner/désélectionner** : Boutons rapides
- **Indicateur visuel** : Bordure bleue et ombre sur les photos sélectionnées
- **Compteur** : Affichage du nombre de photos sélectionnées

### 3. Envoi au Client
- **Un seul bouton** : "Envoyer au client (X photos)"
- **Email automatique** : Récupération auto de l'email client
- **Email design** : Template HTML responsive et professionnel
- **Informations contextuelles** :
  - Nom du chantier
  - Photos en haute résolution
  - Nom des fichiers
  - Coordonnées de l'entreprise

## 🎨 Design

### Interface Principale
```
┌─────────────────────────────────────────────────────┐
│  📷 Galerie photos                                   │
│  12 photos • 3 sélectionnées                        │
│                                                      │
│  [Désélectionner tout] [Envoyer au client (3)] [...] │
└─────────────────────────────────────────────────────┘

┌─────┬─────┬─────┬─────┐
│ ✓   │ ✓   │     │ ✓   │  ← Photos avec checkbox
│ 📷  │ 📷  │ 📷  │ 📷  │
│     │     │     │     │
└─────┴─────┴─────┴─────┘
```

### Email au Client
```
┌────────────────────────────────────────┐
│  [Gradient bleu Builty]                │
│  Photos de votre chantier              │
└────────────────────────────────────────┘

Bonjour [Client],

Nous vous transmettons 3 photos de
l'avancement de votre chantier [Nom].

┌─────────────────────┐
│                     │
│   [Photo 1]         │
│                     │
│ nom_fichier.jpg     │
└─────────────────────┘

┌─────────────────────┐
│                     │
│   [Photo 2]         │
│                     │
│ nom_fichier.jpg     │
└─────────────────────┘

[Contact entreprise]
```

## 🗂️ Architecture

### Fichiers créés

1. **Hook**
   - `src/hooks/useProjectPhotos.ts` : Gestion des photos (upload, liste, suppression, envoi)

2. **Composant**
   - `src/components/projects/ProjectPhotosGallery.tsx` : Interface galerie avec sélection

3. **Modal modifié**
   - `src/components/projects/ProjectViewModal.tsx` : Ajout onglet "Photos du chantier"

4. **Base de données**
   - `supabase/migrations/create_project_photos.sql` : Table + RLS + Storage

5. **Edge Function**
   - `supabase/functions/send-project-photos/index.ts` : Envoi emails via Resend

6. **Documentation**
   - `PHOTOS_SETUP.md` : Guide de configuration complet

## 💾 Schéma de données

```sql
project_photos
├── id (UUID, PK)
├── project_id (UUID, FK → projects)
├── company_id (UUID, FK → companies)
├── file_url (TEXT)
├── file_name (TEXT)
├── description (TEXT, nullable)
├── uploaded_by (UUID, FK → profiles)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔒 Sécurité

- **RLS activé** : Seuls les membres de l'entreprise peuvent voir/gérer les photos
- **Storage public** : Photos accessibles via URL pour l'email
- **Authentification requise** : Upload/suppression nécessite connexion
- **Cascade delete** : Photos supprimées si chantier supprimé

## 📊 Flux utilisateur

```
1. Ouvrir un chantier
   ↓
2. Cliquer sur onglet "Photos du chantier"
   ↓
3. Ajouter des photos
   ├─→ Upload direct vers Supabase Storage
   ├─→ Enregistrement en base de données
   └─→ Affichage dans la galerie
   ↓
4. Sélectionner les photos à envoyer
   ├─→ Clic sur photo ou checkbox
   ├─→ Compteur mis à jour
   └─→ Bouton "Envoyer au client" activé
   ↓
5. Cliquer sur "Envoyer au client"
   ├─→ Récupération email client (auto)
   ├─→ Appel Edge Function
   ├─→ Génération email HTML
   ├─→ Envoi via Resend API
   └─→ Confirmation à l'utilisateur
```

## 🎯 Points clés

### Avantages
✅ Interface intuitive et moderne
✅ Upload rapide et fiable
✅ Email professionnel automatique
✅ Pas besoin de télécharger/réenvoyer manuellement
✅ Historique des photos par chantier
✅ Sécurisé avec RLS

### Limites actuelles
⚠️ Pas de limite de taille de fichier (à configurer)
⚠️ Pas de description par photo (prévu mais pas utilisé)
⚠️ Pas de tri/filtrage des photos
⚠️ Resend limité à 3000 emails/mois (plan gratuit)

### Améliorations futures possibles
💡 Ajout de descriptions/notes par photo
💡 Organisation en albums/dates
💡 Comparaison avant/après
💡 Génération PDF avec photos
💡 Watermark automatique
💡 Compression automatique des images
💡 Support vidéo

## 🚀 Performance

- Photos stockées dans CDN Supabase (rapide)
- Lazy loading des images dans la galerie
- Upload en arrière-plan
- Edge Function pour envoi email (serverless)

## 💰 Coûts

- **Supabase Storage** : 1 Go gratuit, puis ~$0.021/Go/mois
- **Resend** : 3000 emails gratuits/mois, puis $20/mois pour 50k
- **Edge Functions** : Inclus dans le plan Supabase

## 📱 Responsive

- Galerie adaptative (2/3/4 colonnes selon écran)
- Email responsive (desktop/mobile/tablette)
- Touch-friendly sur mobile
