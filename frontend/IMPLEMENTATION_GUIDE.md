# Guide d'Implémentation - Architecture Moderne

## ✅ Ce qui a été fait

### 1. Atomic Design Structure
- ✅ Création de la structure `components/atoms/`, `components/molecules/`, `components/organisms/`
- ✅ Composants atoms : Button, Input, Alert
- ✅ Composants molecules : FormField
- ✅ Composants organisms : LoginForm, RegisterForm

### 2. React Hook Form + Zod
- ✅ Installation des dépendances (`react-hook-form`, `@hookform/resolvers`, `zod`)
- ✅ Création des schémas de validation dans `lib/validations/auth.ts`
- ✅ Conversion des formulaires login et register vers React Hook Form

### 3. Server-Side Rendering
- ✅ Conversion de la page d'accueil (`/`) en Server Component
- ✅ Implémentation du cache avec `cachedFetch` et `revalidate`
- ✅ Ajout des métadonnées SEO avec `metadata`

### 4. Cache API
- ✅ Création de `lib/api-cache.ts` avec fonctions `cachedFetch` et `dynamicFetch`
- ✅ Exemple d'utilisation dans la page d'accueil

## 📦 Installation des dépendances

```bash
cd frontend
npm install
```

Les dépendances suivantes ont été ajoutées à `package.json` :
- `react-hook-form`: ^7.53.0
- `@hookform/resolvers`: ^3.9.0
- `zod`: ^3.23.8

## 🔄 Prochaines étapes recommandées

### 1. Convertir les autres formulaires
- [ ] `TransferModal` dans `dashboard/page.tsx`
- [ ] Formulaire de création de compte
- [ ] Formulaire de contact

### 2. Optimiser le cache avec SWR ou React Query
```bash
npm install swr
# ou
npm install @tanstack/react-query
```

Exemple avec SWR :
```typescript
import useSWR from 'swr';

function useAccounts() {
  const { data, error, isLoading } = useSWR('/api/accounts', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });
  return { accounts: data, loading: isLoading, error };
}
```

### 3. Créer des contextes supplémentaires
- [ ] `AccountContext` : Gérer l'état des comptes actifs
- [ ] Optimiser `AuthContext` avec `useMemo` et `useCallback`

### 4. Convertir d'autres pages en Server Components
- [ ] `/register/sent` : Peut être un Server Component
- [ ] Pages statiques du dashboard (si applicable)

### 5. Implémenter le cache pour les routes API
Dans `next.config.js` :
```javascript
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};
```

## 📝 Structure des fichiers créés

```
frontend/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── Alert/
│   │   ├── molecules/
│   │   │   └── FormField/
│   │   └── organisms/
│   │       ├── LoginForm/
│   │       └── RegisterForm/
│   ├── lib/
│   │   ├── validations/
│   │   │   └── auth.ts
│   │   └── api-cache.ts
│   ├── hooks/
│   │   └── useAccounts.ts
│   └── app/
│       ├── page.tsx (Server Component)
│       ├── login/
│       │   └── page.tsx (utilise LoginForm)
│       └── register/
│           └── page.tsx (utilise RegisterForm)
├── ARCHITECTURE.md
└── IMPLEMENTATION_GUIDE.md
```

## 🎯 Exemples d'utilisation

### Utiliser un formulaire avec validation
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Utiliser le cache API dans un Server Component
```typescript
import { cachedFetch } from "@/lib/api-cache";

export default async function Page() {
  const data = await cachedFetch("/api/endpoint", {
    next: { revalidate: 3600 }, // Cache 1 heure
  });
  return <div>{data}</div>;
}
```

### Utiliser un composant atomique
```typescript
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

<Button variant="primary" isLoading={loading}>
  Envoyer
</Button>
```

## ⚠️ Notes importantes

1. **Les alias TypeScript** (`@/*`) sont configurés dans `tsconfig.json`
2. **Les Server Components** ne peuvent pas utiliser les hooks React
3. **Le cache Next.js** fonctionne uniquement avec `fetch()` natif
4. **Les formulaires** doivent être dans des Client Components (`"use client"`)

## 🚀 Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linter
npm run lint
```

