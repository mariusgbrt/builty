# Système de Canaux pour la Messagerie Builty

## Vue d'ensemble

Le système de messagerie Builty a été transformé en un système de canaux organisé par chantier, similaire à Slack ou Discord. Chaque chantier dispose automatiquement de son propre canal de discussion, et un canal général existe pour toute l'équipe.

## Fonctionnalités principales

### 1. **Canal Général**
- **Création automatique** : Créé automatiquement lors de la création d'une entreprise
- **Membres** : Tous les membres de l'entreprise sont automatiquement ajoutés
- **Rôles** : Les admins sont "admin" du canal, les autres sont "membre"
- **Permissions** : Tous les membres peuvent voir et envoyer des messages
- **Non-supprimable** : Le canal général ne peut pas être supprimé

### 2. **Canaux par Chantier**
- **Création automatique** : Un canal est créé automatiquement à chaque création de chantier
- **Nom** : "Chantier: [Nom du chantier]"
- **Description** : "Canal de discussion pour le chantier [Nom du chantier]"
- **Membres initiaux** : Tous les admins de l'entreprise
- **Gestion des membres** : Les admins peuvent ajouter/retirer des employés dans chaque canal

### 3. **Gestion des Membres**
Les administrateurs peuvent :
- Ajouter des employés à un canal de chantier
- Retirer des employés d'un canal de chantier
- Promouvoir un membre en admin du canal
- Rétrograder un admin de canal en membre

### 4. **Interface Utilisateur**
- **Sidebar gauche** : Liste de tous les canaux accessibles à l'utilisateur
  - Canal général en premier
  - Canaux de chantiers triés par nom
  - Indicateur visuel du canal actif
- **Zone principale** : Messages du canal sélectionné
  - Header avec nom du canal et description
  - Bouton "Gérer les membres" (admin uniquement)
  - Zone de messages avec historique
  - Zone de saisie pour envoyer des messages

## Configuration de la Base de Données

### Tables créées

#### 1. **channels**
```sql
- id: UUID (Primary Key)
- company_id: UUID (Foreign Key → companies)
- name: VARCHAR(255)
- description: TEXT
- channel_type: VARCHAR(20) ('general' | 'project')
- project_id: UUID (Foreign Key → projects, nullable)
- created_by: UUID (Foreign Key → profiles)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. **channel_members**
```sql
- id: UUID (Primary Key)
- channel_id: UUID (Foreign Key → channels)
- user_id: UUID (Foreign Key → profiles)
- role: VARCHAR(20) ('admin' | 'member')
- joined_at: TIMESTAMP
- UNIQUE(channel_id, user_id)
```

#### 3. **messages** (modifié)
```sql
- ... (colonnes existantes)
- channel_id: UUID (Foreign Key → channels) -- NOUVEAU
```

### Triggers automatiques

#### 1. **create_general_channel_for_company**
- **Quand** : Lors de la création d'une nouvelle entreprise
- **Action** : 
  - Crée un canal "Général" pour l'entreprise
  - Ajoute tous les membres de l'entreprise au canal
  - Définit les admins comme "admin" du canal

#### 2. **create_channel_for_project**
- **Quand** : Lors de la création d'un nouveau chantier
- **Action** :
  - Crée un canal "Chantier: [Nom]" lié au projet
  - Ajoute tous les admins de l'entreprise au canal
  - Les définit comme "admin" du canal

#### 3. **add_member_to_general_channel**
- **Quand** : Lors de l'ajout d'un nouveau membre à l'entreprise
- **Action** :
  - Ajoute automatiquement le nouveau membre au canal général
  - Le définit comme "admin" s'il est Admin, "membre" sinon

### Row Level Security (RLS)

#### Channels
- **SELECT** : Les utilisateurs ne voient que les canaux de leur entreprise dont ils sont membres
- **INSERT** : Seuls les admins de l'entreprise peuvent créer des canaux
- **UPDATE/DELETE** : Seuls les admins de l'entreprise peuvent modifier/supprimer des canaux

#### Channel Members
- **SELECT** : Les utilisateurs voient les membres des canaux auxquels ils appartiennent
- **INSERT/DELETE** : Seuls les admins du canal ou les admins de l'entreprise peuvent ajouter/retirer des membres

#### Messages
- **SELECT** : Les utilisateurs ne voient que les messages des canaux dont ils sont membres
- **INSERT** : Les utilisateurs peuvent envoyer des messages dans les canaux dont ils sont membres
- **UPDATE/DELETE** : Les utilisateurs peuvent modifier/supprimer leurs propres messages

## Migration des Données Existantes

La migration SQL inclut des scripts pour :

### 1. Créer les canaux généraux pour les entreprises existantes
```sql
DO $$
DECLARE
  company_record RECORD;
  new_channel_id UUID;
BEGIN
  FOR company_record IN SELECT id FROM companies WHERE ...
  LOOP
    -- Crée le canal général
    -- Ajoute tous les membres
  END LOOP;
END $$;
```

### 2. Créer les canaux pour les chantiers existants
```sql
DO $$
DECLARE
  project_record RECORD;
  new_channel_id UUID;
BEGIN
  FOR project_record IN SELECT id, company_id, name FROM projects WHERE ...
  LOOP
    -- Crée le canal du chantier
    -- Ajoute tous les admins
  END LOOP;
END $$;
```

## Étapes d'Activation

### 1. Base de données Supabase

**Dans l'interface Supabase SQL Editor** :

```sql
-- Exécuter le fichier de migration
-- Copier-coller le contenu de :
-- supabase/migrations/create_channels.sql
```

Cela va :
- ✅ Créer les tables `channels` et `channel_members`
- ✅ Ajouter la colonne `channel_id` à la table `messages`
- ✅ Créer les index pour les performances
- ✅ Configurer les politiques RLS
- ✅ Créer les triggers automatiques
- ✅ Migrer les données existantes (canaux généraux et canaux de chantiers)
- ✅ Activer Realtime sur les nouvelles tables

### 2. Vérification

Après l'exécution de la migration, vérifier :

1. **Tables créées** :
```sql
SELECT * FROM channels LIMIT 5;
SELECT * FROM channel_members LIMIT 5;
```

2. **Canal général existe** :
```sql
SELECT * FROM channels WHERE channel_type = 'general';
```

3. **Canaux de chantiers créés** :
```sql
SELECT c.*, p.name as project_name 
FROM channels c 
LEFT JOIN projects p ON c.project_id = p.id 
WHERE c.channel_type = 'project';
```

4. **Membres correctement assignés** :
```sql
SELECT cm.*, p.full_name 
FROM channel_members cm 
JOIN profiles p ON cm.user_id = p.id 
ORDER BY cm.channel_id, cm.role;
```

### 3. Test de l'Application

1. Connectez-vous à l'application
2. Accédez à **Messagerie** dans le menu
3. Vérifiez que vous voyez :
   - Le canal "Général" en haut de la liste
   - Tous les canaux de vos chantiers
4. Testez :
   - Envoi de message dans le canal général
   - Navigation entre les canaux
   - En tant qu'admin : gestion des membres d'un canal de chantier

## Utilisation pour les Utilisateurs

### Pour les Admins

1. **Gérer les membres d'un canal de chantier** :
   - Ouvrir la messagerie
   - Sélectionner un canal de chantier (pas le général)
   - Cliquer sur "Gérer les membres"
   - Ajouter/retirer des employés selon leur implication dans le chantier

2. **Promouvoir un membre en admin du canal** :
   - Dans la gestion des membres
   - Cliquer sur "→ Admin" à côté d'un membre
   - L'utilisateur pourra alors aussi gérer les membres du canal

### Pour les Employés

1. **Voir ses canaux** :
   - Accéder à la messagerie
   - La sidebar liste tous les canaux accessibles
   - Canal général + canaux des chantiers assignés

2. **Envoyer des messages** :
   - Cliquer sur un canal dans la sidebar
   - Taper un message dans la zone de saisie
   - Envoyer avec le bouton ou Entrée

3. **Partager des médias** :
   - Utiliser les boutons Image/Vidéo
   - Sélectionner un fichier
   - Le fichier est automatiquement envoyé dans le canal actif

## Architecture Technique

### Hooks React

#### `useChannels()`
Gère la liste des canaux et les opérations de gestion :
- Récupère les canaux de l'utilisateur
- Gère les membres d'un canal
- Ajoute/retire des membres
- Met à jour les rôles

#### `useMessages(channelId)`
Gère les messages d'un canal spécifique :
- Récupère les messages du canal
- Envoie des messages texte
- Envoie des médias (images/vidéos)
- Supprime des messages
- Subscription Realtime aux nouveaux messages

### Composants

#### `Messaging.tsx`
Page principale de la messagerie :
- Sidebar avec liste des canaux
- Zone de messages du canal actif
- Zone de saisie
- Gestion du canal actif

#### `ChannelManagementModal.tsx`
Modal de gestion des membres d'un canal :
- Liste des membres actuels
- Ajout de nouveaux membres
- Retrait de membres
- Gestion des rôles (admin/membre)

## Sécurité

### Permissions

1. **Lecture** :
   - Les utilisateurs ne voient que les canaux dont ils sont membres
   - Les messages des autres canaux sont invisibles

2. **Écriture** :
   - Les utilisateurs peuvent envoyer des messages uniquement dans leurs canaux
   - Les messages d'autres canaux ne peuvent pas être créés

3. **Gestion** :
   - Seuls les admins de l'entreprise peuvent gérer les membres des canaux
   - Les admins de canal peuvent aussi gérer les membres
   - Le canal général ne peut pas être géré (tous les membres y sont automatiquement)

### Isolation des données

- Chaque entreprise a ses propres canaux
- Les canaux d'une entreprise sont invisibles aux autres entreprises
- Les messages sont filtrés par canal ET par appartenance de l'utilisateur

## Performance

### Indexes créés

- `idx_channels_company_id` : Recherche rapide des canaux par entreprise
- `idx_channels_project_id` : Liaison canal ↔ projet
- `idx_channel_members_channel_id` : Membres d'un canal
- `idx_channel_members_user_id` : Canaux d'un utilisateur
- `idx_messages_channel_id` : Messages d'un canal

### Optimisations

- **Realtime** : Activé sur `channels`, `channel_members` et `messages`
- **Limitation** : 100 derniers messages par canal (pagination possible)
- **Lazy loading** : Les membres ne sont chargés que lors de l'ouverture du modal de gestion

## Évolutions Futures Possibles

1. **Notifications** :
   - Badge de compteur de messages non lus par canal
   - Notifications push pour nouveaux messages

2. **Recherche** :
   - Recherche de messages dans un canal
   - Recherche globale dans tous les canaux

3. **Fichiers** :
   - Support des fichiers généraux (PDF, documents)
   - Galerie des médias partagés dans un canal

4. **Mentions** :
   - Mentionner des utilisateurs avec @nom
   - Notifications pour les mentions

5. **Threads** :
   - Réponses en fil de discussion
   - Organisation des conversations

6. **Archivage** :
   - Archiver les canaux de chantiers terminés
   - Garder l'historique mais masquer de la liste active

## Support

Pour toute question ou problème :

1. Vérifier que la migration SQL a bien été exécutée
2. Vérifier les politiques RLS dans Supabase
3. Vérifier les logs du navigateur (Console)
4. Vérifier les logs Realtime dans Supabase

## Résumé des Avantages

✅ **Organisation claire** : Un canal par chantier + un canal général  
✅ **Sécurité** : Seuls les membres assignés voient les messages d'un chantier  
✅ **Automatique** : Les canaux se créent automatiquement avec les chantiers  
✅ **Flexible** : Les admins peuvent ajuster les membres de chaque canal  
✅ **Temps réel** : Messages instantanés grâce à Supabase Realtime  
✅ **Scalable** : Supporte un nombre illimité de chantiers et de canaux  
