# 🚨 Activation Rapide - Canaux de Messagerie

## Problème : "Aucun canal disponible"

Si vous voyez ce message, c'est que la base de données n'a pas encore été configurée.

## ✅ Solution en 2 étapes

### Étape 1 : Créer les tables (OBLIGATOIRE si première fois)

**Dans Supabase SQL Editor** :

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu gauche
4. Cliquez sur "+ New query"
5. Copiez-collez le contenu du fichier : `supabase/migrations/create_channels.sql`
6. Cliquez sur "Run" (ou Ctrl+Enter)

⏱️ **Temps d'exécution** : ~5-10 secondes

✅ **Résultat attendu** : Vous devriez voir "Success. No rows returned"

---

### Étape 2 : Créer/Réparer les canaux

**Dans Supabase SQL Editor** :

1. Nouvelle requête ("+ New query")
2. Copiez-collez le contenu du fichier : `supabase/migrations/fix_channels.sql`
3. Cliquez sur "Run"

⏱️ **Temps d'exécution** : ~2-5 secondes

✅ **Résultat attendu** : Dans les "Messages" en bas, vous verrez :
```
NOTICE: OK: La table channels existe
NOTICE: OK: La table channel_members existe
NOTICE: Création du canal général pour l'entreprise: [Votre Entreprise]
NOTICE: Canal général créé avec l'ID: [UUID]
NOTICE: Membres ajoutés au canal général
NOTICE: === RÉSUMÉ ===
NOTICE: Total canaux: X
NOTICE: Canaux généraux: 1
NOTICE: Canaux chantiers: Y
```

Puis un tableau s'affiche avec tous vos canaux.

---

## 🎉 C'est fait !

**Rafraîchissez votre application** (F5) et retournez dans "Messagerie".

Vous devriez maintenant voir :
- ✅ Un canal "Général"
- ✅ Un canal pour chaque chantier existant
- ✅ Un bouton "+" en haut à droite (pour les admins)

---

## 🆕 Créer un nouveau canal manuellement

En tant qu'admin, vous pouvez maintenant :

1. Cliquer sur le bouton **"+"** en haut à droite de la sidebar
2. Choisir le type de canal :
   - **Personnalisé** : Pour un usage spécifique (ex: "Support", "Achats")
   - **Général** : Tous les membres y auront accès
   - **Chantier** : Lié à un chantier existant

3. Remplir les informations :
   - Nom du canal
   - Description (optionnel)
   - Sélectionner un chantier (si type Chantier)

4. Cliquer sur "Créer le canal"

Le canal est créé instantanément et visible pour les membres concernés !

---

## 🔍 Vérification manuelle (optionnel)

Si vous voulez vérifier que tout fonctionne dans Supabase :

```sql
-- Voir tous les canaux
SELECT * FROM channels;

-- Voir tous les membres des canaux
SELECT 
  cm.*,
  p.full_name,
  c.name as channel_name
FROM channel_members cm
JOIN profiles p ON cm.user_id = p.id
JOIN channels c ON cm.channel_id = c.id;

-- Compter les messages par canal
SELECT 
  c.name,
  COUNT(m.id) as message_count
FROM channels c
LEFT JOIN messages m ON m.channel_id = c.id
GROUP BY c.id, c.name;
```

---

## ❓ Questions fréquentes

### Je ne vois toujours aucun canal après les 2 étapes

**Solutions** :

1. **Vérifier que vous êtes bien admin** :
```sql
SELECT * FROM profiles WHERE id = auth.uid();
-- Le champ "role" doit être "Admin"
```

2. **Vérifier que votre entreprise existe** :
```sql
SELECT * FROM companies;
```

3. **Forcer la création du canal général** :
```sql
-- Remplacez YOUR_COMPANY_ID par votre ID d'entreprise
INSERT INTO channels (company_id, name, description, channel_type)
VALUES ('YOUR_COMPANY_ID', 'Général', 'Canal général', 'general')
RETURNING id;

-- Puis ajoutez-vous au canal (remplacez CHANNEL_ID et YOUR_USER_ID)
INSERT INTO channel_members (channel_id, user_id, role)
VALUES ('CHANNEL_ID', 'YOUR_USER_ID', 'admin');
```

### Les canaux existent mais je ne les vois pas

**Problème de permissions RLS**. Vérifiez :

```sql
-- Voir vos canaux normalement
SELECT 
  c.*,
  EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = c.id 
    AND user_id = auth.uid()
  ) as i_am_member
FROM channels c
WHERE c.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid());
```

Si `i_am_member` est `false`, ajoutez-vous manuellement :

```sql
-- Remplacez CHANNEL_ID par l'ID du canal
INSERT INTO channel_members (channel_id, user_id, role)
VALUES ('CHANNEL_ID', auth.uid(), 'admin');
```

### Un employé ne voit pas ses canaux

**L'admin doit l'ajouter** :

1. Allez dans "Messagerie"
2. Sélectionnez le canal
3. Cliquez sur "Gérer les membres"
4. Ajoutez l'employé

Ou en SQL :

```sql
-- Remplacez CHANNEL_ID et USER_ID
INSERT INTO channel_members (channel_id, user_id, role)
VALUES ('CHANNEL_ID', 'USER_ID', 'member');
```

---

## 🆘 Support d'urgence

Si rien ne fonctionne, créez manuellement le canal général :

```sql
-- 1. Créer le canal
INSERT INTO channels (company_id, name, description, channel_type, created_by)
VALUES (
  (SELECT company_id FROM profiles WHERE id = auth.uid()),
  'Général',
  'Canal de discussion générale',
  'general',
  auth.uid()
)
RETURNING id;

-- 2. Copier l'ID retourné et ajoutez-vous
INSERT INTO channel_members (channel_id, user_id, role)
VALUES ('ID_DU_CANAL_CI-DESSUS', auth.uid(), 'admin');

-- 3. Ajouter tous les autres membres de votre entreprise
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  'ID_DU_CANAL_CI-DESSUS',
  id,
  CASE WHEN role = 'Admin' THEN 'admin' ELSE 'member' END
FROM profiles
WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
AND id != auth.uid();
```

---

## 📞 Contact

Si vous avez encore des problèmes :

1. Vérifiez les logs du navigateur (F12 → Console)
2. Vérifiez les logs Supabase (Dashboard → Logs)
3. Assurez-vous que Realtime est activé pour les tables `channels`, `channel_members`, et `messages`

---

## ✨ Fonctionnalités Disponibles

Une fois activé, vous pouvez :

✅ Créer des canaux personnalisés  
✅ Créer des canaux par chantier  
✅ Gérer les membres de chaque canal  
✅ Envoyer des messages, photos, vidéos  
✅ Supprimer vos messages  
✅ Voir l'historique en temps réel  
✅ Organiser votre équipe par projet  

**Bienvenue dans votre nouvelle messagerie professionnelle ! 🎉**
