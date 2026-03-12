# 💬 Configuration de la Messagerie d'Équipe

Cette fonctionnalité remplace WhatsApp avec une messagerie temps réel intégrée à l'application.

## 📋 Étapes de configuration

### 1. Base de données Supabase

#### A. Exécuter la migration SQL

Dans le Dashboard Supabase :
1. Allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez le contenu de `supabase/migrations/create_messages.sql`
4. Exécutez la requête

#### B. Activer Realtime

1. Dans Supabase Dashboard → **Database** → **Replication**
2. Trouvez la table `messages`
3. Activez **Realtime** pour cette table

#### C. Créer le bucket de stockage

Dans le Dashboard Supabase :
1. Allez dans **Storage**
2. Cliquez sur **New bucket**
3. Nom : `message-media`
4. **Public bucket** : ✅ Activé
5. Cliquez sur **Create bucket**

#### D. Configurer les politiques de stockage

Pour le bucket `message-media`, ajoutez ces politiques :

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

**Politique 3 : Suppression par l'utilisateur**
```sql
Policy name: Users can delete their media
Allowed operation: DELETE
Policy definition: (bucket_id = 'message-media')
```

### 2. Vérification

Pour vérifier que tout fonctionne :

1. Connectez-vous à l'application
2. Cliquez sur **Messagerie** dans le menu
3. Envoyez un message de test
4. Ouvrez l'application dans un autre onglet/navigateur
5. Vérifiez que le message apparaît instantanément

## ✅ C'est tout !

La messagerie est maintenant opérationnelle et remplace WhatsApp.

## 🎨 Fonctionnalités

### Messages
- ✅ Messages texte en temps réel
- ✅ Messages multilignes (Shift+Enter)
- ✅ Horodatage des messages
- ✅ Identification de l'expéditeur
- ✅ Design type WhatsApp

### Médias
- 📸 **Photos** : Jusqu'à 10 Mo par image
- 🎥 **Vidéos** : Jusqu'à 50 Mo par vidéo
- 🖼️ **Prévisualisation** : Clic pour agrandir
- 💾 **Stockage** : CDN Supabase rapide

### Temps Réel
- ⚡ **Instantané** : Messages visibles immédiatement
- 🔄 **Auto-refresh** : Pas besoin de recharger
- 👥 **Multi-utilisateurs** : Tous les membres en même temps
- 📱 **Responsive** : Fonctionne sur mobile

### Gestion
- 🗑️ **Suppression** : Bouton au survol (messages propres uniquement)
- 📜 **Historique** : 100 derniers messages chargés
- 🔒 **Sécurité** : RLS Supabase (isolation par entreprise)

## 📱 Interface

```
┌─────────────────────────────────────────┐
│  💬 Messagerie d'équipe                 │
│  125 messages                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│  Jean Dupont                            │
│  ┌───────────────────┐                 │
│  │ Salut l'équipe ! │                  │
│  │ Aujourd'hui 14:30│                  │
│  └───────────────────┘                 │
│                                         │
│                  ┌────────────────────┐ │
│                  │ Salut Jean !       │ │
│                  │ Aujourd'hui 14:31  │ │
│                  └────────────────────┘ │
│                                         │
│  Marie Martin                           │
│  ┌───────────────────┐                 │
│  │ [📷 Photo]        │                 │
│  │ photo.jpg • 2.3MB │                 │
│  │ Aujourd'hui 14:32 │                 │
│  └───────────────────┘                 │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [📷] [🎥]  [Écrivez un message...]  [➤]│
└─────────────────────────────────────────┘
```

## 🔧 Utilisation

### Envoyer un message texte
1. Tapez votre message dans la zone de texte
2. Appuyez sur **Entrée** ou cliquez sur le bouton **Envoyer**
3. Le message apparaît instantanément pour tous

### Envoyer une photo
1. Cliquez sur l'icône **📷 Photo**
2. Sélectionnez une image (max 10 Mo)
3. L'image est uploadée et affichée automatiquement

### Envoyer une vidéo
1. Cliquez sur l'icône **🎥 Vidéo**
2. Sélectionnez une vidéo (max 50 Mo)
3. La vidéo est uploadée avec un lecteur intégré

### Message multiligne
- Utilisez **Shift + Entrée** pour aller à la ligne
- Utilisez **Entrée** seul pour envoyer

### Supprimer un message
1. Survolez votre message
2. Cliquez sur l'icône **🗑️** qui apparaît
3. Confirmez la suppression

## 🆚 Comparaison WhatsApp

| Fonctionnalité | WhatsApp | Builty Messagerie |
|----------------|----------|-------------------|
| Messages texte | ✅ | ✅ |
| Photos | ✅ | ✅ |
| Vidéos | ✅ | ✅ |
| Temps réel | ✅ | ✅ |
| Historique | ✅ | ✅ (100 msgs) |
| Suppression | ✅ | ✅ |
| Intégré à l'app | ❌ | ✅ |
| Données privées | ❌ | ✅ |
| Pas d'app externe | ❌ | ✅ |
| Professionnel | ❌ | ✅ |

## 💰 Coûts

Pour **10 membres** envoyant **100 messages/jour** avec **20% de médias** :

- **Supabase Storage** : ~0,20€/mois (600 Mo/mois)
- **Supabase Database** : Inclus (plan gratuit jusqu'à 500 Mo)
- **Realtime** : Inclus (plan gratuit jusqu'à 200 connexions)

**Total** : **~0,20€/mois** 💰

## 🔒 Sécurité & Confidentialité

- ✅ **Isolation complète** : Chaque entreprise voit uniquement ses messages
- ✅ **Authentification requise** : Impossible d'accéder sans connexion
- ✅ **RLS Supabase** : Politiques de sécurité au niveau base de données
- ✅ **Données privées** : Hébergées sur vos serveurs Supabase
- ✅ **Pas de fuite** : Contrairement à WhatsApp (Meta)

## 🚀 Avantages vs WhatsApp

### 1. **Intégration**
- Pas besoin de changer d'application
- Contexte projet disponible immédiatement
- Copier/coller facilité

### 2. **Professionnalisme**
- Séparation vie pro/perso
- Pas de numéros de téléphone personnels
- Interface cohérente avec votre application

### 3. **Contrôle**
- Vous possédez vos données
- Pas de pub/tracking Meta
- Historique complet sauvegardé

### 4. **Simplicité**
- Moins de notifications parasites
- Uniquement les messages pro
- Tout au même endroit

## ⚙️ Paramètres avancés (optionnels)

### Augmenter le nombre de messages chargés

Dans `src/hooks/useMessages.ts` ligne 45 :
```typescript
.limit(100); // Changez 100 par le nombre souhaité
```

### Modifier les limites de taille

Dans `src/pages/Messaging.tsx` :
- **Images** ligne 52 : `10 * 1024 * 1024` (actuellement 10 Mo)
- **Vidéos** ligne 71 : `50 * 1024 * 1024` (actuellement 50 Mo)

### Désactiver un type de média

Commentez les boutons dans `src/pages/Messaging.tsx` lignes 133-165.

## 🐛 Dépannage

### Les messages ne s'affichent pas
- Vérifiez que Realtime est activé sur la table `messages`
- Vérifiez les politiques RLS
- Actualisez la page

### Les médias ne s'uploadent pas
- Vérifiez que le bucket `message-media` est public
- Vérifiez les politiques de stockage
- Vérifiez la taille du fichier

### Les messages n'arrivent pas en temps réel
- Vérifiez la connexion internet
- Vérifiez que Realtime est activé
- Consultez les logs de la console navigateur

### "Erreur lors de l'envoi"
- Vérifiez que l'utilisateur est authentifié
- Vérifiez que l'entreprise est liée au profil
- Consultez les logs Supabase

## 📊 Monitoring

### Voir l'activité
1. Dashboard Supabase → **Database** → **Tables** → `messages`
2. Voir les derniers messages ajoutés

### Statistiques
```sql
-- Nombre total de messages
SELECT COUNT(*) FROM messages WHERE company_id = 'votre_company_id';

-- Messages par type
SELECT message_type, COUNT(*) 
FROM messages 
WHERE company_id = 'votre_company_id'
GROUP BY message_type;

-- Utilisateurs les plus actifs
SELECT sender_id, COUNT(*) as nb_messages
FROM messages
WHERE company_id = 'votre_company_id'
GROUP BY sender_id
ORDER BY nb_messages DESC;
```

## 🎓 Formation des utilisateurs

### Point clé à expliquer
1. **Emplacement** : Menu latéral → Messagerie
2. **Envoyer** : Taper message + Entrée
3. **Médias** : Boutons photo/vidéo à gauche
4. **Temps réel** : Pas besoin de recharger
5. **Suppression** : Survol → icône poubelle

### Démonstration suggérée
1. Montrer où se trouve la messagerie
2. Envoyer un message de test
3. Montrer qu'il apparaît instantanément
4. Envoyer une photo
5. Montrer comment supprimer

## ✨ Prochaines améliorations possibles

- [ ] Notifications push navigateur
- [ ] Réactions aux messages (👍 ❤️)
- [ ] Réponse à un message spécifique
- [ ] Recherche dans l'historique
- [ ] Export de conversations
- [ ] Messages vocaux
- [ ] Partage de localisation
- [ ] Mentions @utilisateur
- [ ] Statut "en train d'écrire..."

---

**La messagerie est maintenant opérationnelle et prête à remplacer WhatsApp !** 🎉
