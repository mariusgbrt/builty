# 🎯 Ajout de l'offre SOLO - Documentation

## ✅ Modifications effectuées

### 1. Fichier `src/components/Pricing.tsx`
- ✅ **Nouvelle offre SOLO ajoutée** à 49€/mois (39€/mois en annuel)
- ✅ **Fonctionnalités adaptées** :
  - 1 utilisateur (micro-entrepreneur)
  - 3 chantiers actifs simultanés
  - Devis professionnels illimités
  - Facturation simplifiée
  - Planning personnel
  - Suivi de chantier photo
  - Application mobile
  - Support email

- ✅ **Offre REGULAR mise à jour** :
  - Ajout de "Tout de SOLO, plus :"
  - Fonctionnalités différenciantes mises en avant

- ✅ **Grid responsive adaptée** :
  - Passage de 3 à 4 colonnes
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

### 2. Hiérarchie des offres
```
SOLO (49€) → REGULAR (89€) → PRO (169€) → ENTREPRISE (sur devis)
    ↓             ↓              ↓                ↓
1 utilisateur  8 users      15 users      Illimité
3 chantiers    5 chantiers  8 chantiers   Illimité
Fonctions base +Équipe       +Avancé       +Premium
```

---

## 🔧 Configuration Stripe requise

### Étapes à suivre dans Stripe :

1. **Créer un nouveau produit "Builty SOLO"**
   - Prix : 49€/mois (prix_1_XXXXX)
   - Prix annuel : 468€/an (39€/mois) - économie de 20%
   - Mode : subscription
   - Récurrence : mensuelle

2. **Mettre à jour `src/stripe-config.ts`**

Ajouter au début du tableau `stripeProducts` :

```typescript
{
  id: 'prod_XXXXXXXXX', // ID du produit Stripe
  priceId: 'price_1XXXXXXXXX', // ID du prix mensuel Stripe
  name: 'Builty SOLO',
  description: 'Abonnement mensuel à Builty SOLO',
  price: 49.00,
  currency: 'eur',
  mode: 'subscription',
  limits: {
    employees: 1,
    activeProjects: 3
  }
}
```

3. **Créer aussi le prix annuel dans Stripe**
   - Prix : 468€/an (39€/mois)
   - Afficher l'économie de 120€/an

---

## 📋 Checklist de déploiement

### Backend / Base de données
- [ ] Vérifier que la table `subscriptions` gère le nouveau plan
- [ ] Vérifier les limites dans la logique métier :
  - [ ] Limite de 1 utilisateur pour SOLO
  - [ ] Limite de 3 chantiers actifs pour SOLO
- [ ] Tester les upgrades SOLO → REGULAR
- [ ] Tester les downgrades REGULAR → SOLO

### Frontend
- [x] Offre SOLO ajoutée à Pricing.tsx
- [x] Grid responsive adaptée (4 colonnes)
- [x] Icône User ajoutée
- [ ] Mettre à jour stripe-config.ts avec les vrais IDs Stripe
- [ ] Tester l'affichage responsive sur :
  - [ ] Mobile (1 colonne)
  - [ ] Tablette (2 colonnes)
  - [ ] Desktop (4 colonnes)

### Tests utilisateurs
- [ ] Création de compte avec plan SOLO
- [ ] Vérification des limites :
  - [ ] Bloquer l'ajout d'un 2e utilisateur
  - [ ] Bloquer la création d'un 4e chantier actif
  - [ ] Message clair invitant à upgrader
- [ ] Processus de paiement Stripe
- [ ] Email de confirmation
- [ ] Accès aux fonctionnalités SOLO

---

## 💡 Recommandations marketing

### Positionnement SOLO
**Cible** : Micro-entrepreneurs, artisans solo, auto-entrepreneurs

**Messages clés** :
- "Gérez votre activité en solo efficacement"
- "À partir de 49€/mois - Sans engagement"
- "Parfait pour démarrer seul"
- "Évoluez vers REGULAR quand vous grandissez"

### Arguments de vente vs concurrence
- ✅ **Pas de frais cachés**
- ✅ **Toutes les fonctions essentielles**
- ✅ **Application mobile incluse**
- ✅ **Évolution facile vers offre supérieure**

---

## 🎨 Améliorations futures possibles

### Court terme
1. Ajouter un badge "NOUVEAU" sur la carte SOLO
2. Créer une landing page dédiée aux micro-entrepreneurs
3. Ajouter des témoignages d'artisans solo

### Moyen terme
1. Offrir 1 mois gratuit pour les nouveaux SOLO
2. Programme de parrainage spécial SOLO
3. Webinaires pour micro-entrepreneurs

---

## 📞 Support

En cas de problème :
1. Vérifier les logs Stripe
2. Vérifier les limites en base de données
3. Tester le flow complet en environnement de dev

---

**Dernière mise à jour** : 13 février 2026
**Statut** : Frontend ✅ | Stripe Config ⏳ | Tests ⏳
