# Architecture de l'Application Frontend

## 📐 Atomic Design

L'application suit la méthodologie **Atomic Design** pour organiser les composants :

```
components/
├── atoms/          # Composants de base (Button, Input, Alert)
├── molecules/      # Combinaisons simples (FormField)
├── organisms/      # Composants complexes (LoginForm, RegisterForm)
└── templates/      # Layouts de page (à venir)
```

### Atoms
- **Button** : Bouton réutilisable avec variants (primary, secondary)
- **Input** : Champ de saisie avec label et gestion d'erreur
- **Alert** : Message d'alerte avec types (success, error, warning, info)

### Molecules
- **FormField** : Champ de formulaire avec intégration React Hook Form

### Organisms
- **LoginForm** : Formulaire de connexion complet avec validation Zod
- **RegisterForm** : Formulaire d'inscription avec validation de mot de passe

## 🔐 Validation des Formulaires

### React Hook Form + Zod

Tous les formulaires utilisent **React Hook Form** avec validation **Zod** :

- **Schémas de validation** : `lib/validations/auth.ts`
- **Validation côté client** : Automatique avec Zod
- **Gestion des erreurs** : Intégrée dans les composants

### Schémas disponibles
- `loginSchema` : Email + mot de passe
- `registerSchema` : Prénom, nom, email, mot de passe (avec règles complexes)
- `transferSchema` : IBAN + montant
- `accountSchema` : Nom + type de compte

## 🎯 Contextes React

### Contextes existants
- **AuthContext** : Gestion de l'authentification (token, rôle)
- **ToastContext** : Notifications toast

### Améliorations possibles
- **AccountContext** : Gestion des comptes actifs
- **ThemeContext** : Gestion du thème (si nécessaire)

## 🚀 Server-Side Rendering (SSR)

### Pages Server Components
Les pages suivantes peuvent être converties en Server Components :
- `/` (page d'accueil)
- `/register/sent` (page de confirmation)

### Pages Client Components
Les pages nécessitant de l'interactivité restent en Client Components :
- `/login`
- `/register`
- `/dashboard/*`

### Optimisations SSR à implémenter
1. **Page d'accueil** : Convertir en Server Component
2. **Métadonnées** : Utiliser `generateMetadata` pour le SEO
3. **Données statiques** : Précharger les données avec `fetch` et cache

## 💾 Cache et Performance

### Cache API Next.js

#### 1. Fetch Cache (recommandé)
```typescript
// Dans les Server Components
const data = await fetch(url, {
  next: { revalidate: 3600 } // Cache 1 heure
});
```

#### 2. Route Segment Config
```typescript
export const revalidate = 3600; // Revalidation toutes les heures
```

#### 3. Cache applicatif
- **SWR** ou **React Query** pour le cache côté client
- **localStorage** pour les données persistantes (déjà utilisé)

### Stratégies de cache recommandées

#### Données statiques (taux d'épargne, etc.)
```typescript
// Server Component
export const revalidate = 3600; // 1 heure
```

#### Données utilisateur (comptes, transactions)
```typescript
// Client Component avec SWR
const { data } = useSWR('/api/accounts', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
});
```

## 📦 Dépendances Installées

```json
{
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0",
  "zod": "^3.23.8"
}
```

## 🔄 Prochaines Étapes

### 1. Convertir les formulaires restants
- [ ] Formulaire de virement (TransferModal)
- [ ] Formulaire de création de compte
- [ ] Formulaire de contact

### 2. Optimiser le SSR
- [ ] Convertir la page d'accueil en Server Component
- [ ] Ajouter `generateMetadata` pour le SEO
- [ ] Implémenter le cache avec `fetch` et `revalidate`

### 3. Implémenter le cache API
- [ ] Installer SWR ou React Query
- [ ] Créer des hooks personnalisés pour les données
- [ ] Configurer le cache pour les endpoints API

### 4. Améliorer les contextes
- [ ] Créer AccountContext pour gérer les comptes
- [ ] Optimiser AuthContext avec useMemo/useCallback

## 📝 Notes

- Les alias TypeScript sont configurés dans `tsconfig.json` (`@/*`)
- Tous les composants suivent la convention PascalCase
- Les exports utilisent des fichiers `index.ts` pour faciliter les imports

