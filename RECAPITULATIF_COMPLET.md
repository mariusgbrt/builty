# 📋 RÉCAPITULATIF COMPLET - Modifications Builty

## ✅ TERMINÉ - Corrections Phase 1 + Offre SOLO

### 1. ✅ Fonction utilitaire créée (`src/utils/format.ts`)
- `formatCurrency()` : formatage unifié avec espace insécable
- `formatNumber()` : formatage nombres français

### 2. ✅ Dashboard.tsx
- Montants avec `formatCurrency()`
- Labels KPI : `text-xs` → `text-sm`
- Margin icône : `mb-3` → `mb-4`
- Alertes avec formatage correct
- Euro à droite avec `whitespace-nowrap` ✅

### 3. ✅ Projects.tsx
- Import `formatCurrency`
- Bouton Exporter : suppression `mr-2` redondant
- Montants tableau avec `formatCurrency(amount, 2)`

### 4. ✅ Invoices.tsx
- Import `formatCurrency`
- Stats total uniformisé
- Tableau montants TTC et payés

### 5. ✅ Quotes.tsx
- Import `formatCurrency`
- Stats total uniformisé
- Montants tableau
- Barre progression : `h-2.5` → `h-2`

### 6. ✅ Settings.tsx
- Tous les titres : `text-2xl font-extrabold text-builty-gray mb-8`
- Headers tableaux uniformisés
- Background : `bg-gray-50` → `bg-builty-gray-lighter`
- Padding et borders cohérents

### 7. ✅ Sidebar.tsx
- Section utilisateur : `px-3` → `px-4`
- Avatar : `w-9 h-9` → `w-10 h-10`

### 8. ✅ ProjectViewModal.tsx
- Import `formatCurrency`
- Montant HT formaté

### 9. ✅ **NOUVEAU** : Offre SOLO ajoutée
- Prix : 49€/mois (39€/mois en annuel)
- Cible : Micro-entrepreneurs solo
- Fonctionnalités adaptées (1 user, 3 chantiers)
- Grid : 3 → 4 colonnes responsive
- Documentation complète créée

---

## 🔴 PRIORITÉ CRITIQUE - À faire immédiatement

### 1. Remplacer `text-[#0D47A1]` par `text-builty-blue` (10 fichiers)

| Fichier | Lignes affectées | Temps |
|---------|------------------|-------|
| `ClientViewModal.tsx` | 46, 50, 54, 67 | 2 min |
| `SubscriptionCard.tsx` | 35, 40, 53, 61, 69, 81 | 3 min |
| `Settings.tsx` | 769, 806, 818 | 2 min |
| `Planning.tsx` | À identifier | 3 min |
| `QuoteFormModal.tsx` | À identifier | 2 min |
| `InvoiceFormModal.tsx` | À identifier | 2 min |
| Auth pages | À identifier | 3 min |
| **TOTAL** | - | **20 min** |

**Impact** : 🔴 Critique - Design system cassé

---

### 2. Uniformiser titres modales `text-gray-900` → `text-builty-gray`

**13 modales à corriger** :
```
InvoiceViewModal.tsx
QuoteViewModal.tsx  
ClientViewModal.tsx
ProjectViewModal.tsx
ProjectFormModal.tsx
InvoiceFormModal.tsx
QuoteFormModal.tsx
AllocationViewModal.tsx
AllocationFormModal.tsx
ResourceFormModal.tsx
ServiceFormModal.tsx
ChannelManagementModal.tsx
CreateChannelModal.tsx
```

**Regex search** : `text-2xl font-bold text-gray-900`
**Remplacer par** : `text-2xl font-extrabold text-builty-gray`

**Temps** : 25 min  
**Impact** : 🔴 Critique - Cohérence visuelle

---

### 3. Configuration Stripe pour SOLO

**Étapes** :
1. Créer produit Stripe "Builty SOLO"
2. Prix mensuel : 49€
3. Prix annuel : 468€/an (39€/mois)
4. Mettre à jour `stripe-config.ts`

**Code à ajouter** :
```typescript
{
  id: 'prod_XXXXX',
  priceId: 'price_1XXXXX',
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

**Temps** : 30 min  
**Impact** : 🔴 Critique - Fonctionnel

**TOTAL PHASE CRITIQUE : 1h 15min**

---

## 🟡 PRIORITÉ HAUTE - Cohérence visuelle

### 4. Backgrounds `bg-gray-50` → `bg-builty-gray-lighter`

**Fichiers concernés** (8+) :
- Toutes les modales (sections info)
- Settings (sections)
- Cards de stats
- Formulaires

**Méthode** :
1. Search global : `bg-gray-50`
2. Analyser contexte
3. Remplacer si c'est un fond de section

**Temps** : 30 min  
**Impact** : 🟡 Haute

---

### 5. Espacements uniformisés

**Standards à appliquer** :

| Élément | Standard |
|---------|----------|
| Padding cartes | `p-6` |
| Gap éléments | `gap-6` |
| Margin bottom sections | `mb-8` |
| Margin bottom sous-titres | `mb-6` |
| Labels formulaires | `mb-2` |

**Temps** : 1h  
**Impact** : 🟡 Haute

---

### 6. Typographie

**H4 - Sous-titres** :
```tsx
// ❌ AVANT
<h4 className="font-semibold text-gray-900">

// ✅ APRÈS
<h4 className="text-lg font-bold text-builty-gray">
```

**Labels** :
```tsx
// ✅ STANDARD
<label className="text-sm font-medium text-builty-gray-light mb-2">
```

**Descriptions** :
```tsx
// ✅ STANDARD
<p className="text-sm text-builty-gray-light">
```

**Temps** : 1h 30min  
**Impact** : 🟡 Haute

---

### 7. Bordures et ombres

**Standards** :
```css
/* Cartes */
border-2 border-gray-100
hover:border-builty-blue/30

/* Ombres */
shadow-sm /* Repos */
hover:shadow-lg /* Hover */
shadow-xl /* Modales */
```

**Temps** : 30 min  
**Impact** : 🟡 Haute

**TOTAL PHASE HAUTE : 3h 30min**

---

## 🟢 PRIORITÉ MOYENNE - Polish

### 8. Icônes uniformisées

| Contexte | Taille |
|----------|--------|
| Petites actions | `h-4 w-4` |
| Actions standard | `h-5 w-5` |
| Décoratives | `h-6 w-6` |
| Grandes | `h-8 w-8` |

**Temps** : 30 min

---

### 9. Badges standardisés

```tsx
<Badge variant="info">
  {/* text-xs font-bold px-2.5 py-1 rounded-full */}
</Badge>
```

**Temps** : 15 min

---

### 10. Buttons

- Vérifier tous les `gap-2` (pas de `mr-2`)
- Uniformiser sizes : `sm`, `md`, `lg`
- États disabled cohérents

**Temps** : 15 min

**TOTAL PHASE MOYENNE : 1h**

---

## 🔵 PRIORITÉ BASSE - Optimisations

### 11. Transitions

Appliquer partout :
```tsx
transition-all duration-200
```

**Temps** : 20 min

---

### 12. Focus states (Accessibilité)

Standard :
```tsx
focus:ring-2 focus:ring-builty-blue focus:ring-offset-2 
focus:border-builty-blue outline-none
```

**Temps** : 30 min

---

### 13. Loading states

Créer composant standard :
```tsx
<LoadingState />
// → Spinner + "Chargement..."
```

**Temps** : 30 min

---

### 14. Responsive testing

- [ ] Mobile : 1 colonne pricing
- [ ] Tablette : 2 colonnes
- [ ] Desktop : 4 colonnes
- [ ] Textes adaptés (`text-xl md:text-2xl`)
- [ ] Modales qui ne débordent pas

**Temps** : 1h 30min

**TOTAL PHASE BASSE : 2h 50min**

---

## 📊 SYNTHÈSE TOTALE

| Phase | Priorité | Temps | Impact | Statut |
|-------|----------|-------|--------|--------|
| **Corrections initiales** | ✅ | - | ⭐⭐⭐⭐⭐ | **FAIT** |
| **Offre SOLO** | ✅ | - | ⭐⭐⭐⭐⭐ | **FAIT** |
| **Phase Critique** | 🔴 | 1h 15min | ⭐⭐⭐⭐⭐ | **À FAIRE** |
| **Phase Haute** | 🟡 | 3h 30min | ⭐⭐⭐⭐ | **À FAIRE** |
| **Phase Moyenne** | 🟢 | 1h | ⭐⭐⭐ | **À FAIRE** |
| **Phase Basse** | 🔵 | 2h 50min | ⭐⭐ | **À FAIRE** |
| **TOTAL RESTANT** | - | **8h 35min** | - | - |

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Aujourd'hui (2h)
1. ✅ ~~Corriger euro Dashboard~~ → **FAIT**
2. ✅ ~~Ajouter offre SOLO~~ → **FAIT**
3. 🔴 Remplacer `text-[#0D47A1]` (20 min)
4. 🔴 Titres modales (25 min)
5. 🔴 Config Stripe SOLO (30 min)
6. 🟡 Backgrounds (30 min)

### Demain (3h)
7. 🟡 Espacements (1h)
8. 🟡 Typographie (1h 30min)
9. 🟡 Bordures/ombres (30 min)

### Après-demain (2h)
10. 🟢 Icônes (30 min)
11. 🟢 Badges (15 min)
12. 🟢 Buttons (15 min)
13. 🔵 Transitions (20 min)
14. 🔵 Focus states (30 min)

### Semaine prochaine (2h)
15. 🔵 Loading states (30 min)
16. 🔵 Responsive testing (1h 30min)

---

## 🏆 SCORE OBJECTIF

| Critère | Actuel | Après Phase Critique | Après Phase Haute | Après Phase Moyenne | Après Phase Basse |
|---------|--------|---------------------|-------------------|---------------------|-------------------|
| **Alignement** | 9/10 | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ |
| **Espacement** | 9/10 | 9/10 | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ |
| **Typographie** | 8/10 | 9/10 | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ |
| **Couleurs** | 8/10 | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ |
| **Cohérence** | 8/10 | 9/10 | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ |
| **Responsive** | 7/10 | 7/10 | 8/10 | 8/10 | **10/10** ✅ |
| **Accessibilité** | 6/10 | 6/10 | 7/10 | 8/10 | **10/10** ✅ |
| **Offres** | 7/10 | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ | **10/10** ✅ |
| **TOTAL** | **7.8/10** | **9.0/10** | **9.4/10** | **9.6/10** | **10/10** ✅ |

---

## 📝 Notes importantes

### Offre SOLO
- ✅ Frontend prêt
- ⏳ Config Stripe en attente
- ⏳ Tests limites à faire
- ⏳ Migration/upgrade flows à implémenter

### Design System
- Presque terminé, il reste surtout de la cohérence à finaliser
- Pas de refonte majeure requise
- Juste des ajustements fins

### Tests
- Penser à tester :
  - Tous les parcours pricing
  - Upgrades SOLO → REGULAR → PRO
  - Limites pour chaque plan
  - Responsive sur vrais devices

---

**Créé le** : 13 février 2026  
**Statut** : ✅ Phase initiale + SOLO terminée | 🔴 Phase critique en attente  
**Prochaine étape** : Remplacer les `text-[#0D47A1]`
