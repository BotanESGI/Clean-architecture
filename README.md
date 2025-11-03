# Banque AVENIR - Plateforme Bancaire

Une application bancaire moderne développée avec une architecture propre (Clean Architecture) et une interface utilisateur inspirée des meilleures pratiques UX/UI.

## 📸 Captures d'écran

### Page d'accueil
La page d'accueil présente une interface moderne avec un thème sombre et des accents néon. Elle inclut :
- Un header avec navigation et boutons d'action
- Une section hero avec titre principal "La meilleure plateforme bancaire pour votre avenir"
- Des cartes de fonctionnalités (Comptes particuliers et professionnels, Sécurité et conformité, Dépôts protégés)
- Des statistiques et indicateurs visuels
- Un design responsive avec effets de glassmorphism

### Page de connexion
- Design minimaliste avec formulaire à labels flottants
- Section informative à gauche (sur desktop)
- Validation en temps réel avec messages d'erreur stylisés
- Animation et transitions fluides

### Page d'inscription
- Formulaire multi-champs (Prénom, Nom, Email, Mot de passe)
- Validation côté client et serveur du mot de passe (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
- Page de confirmation après inscription indiquant la vérification email

### Dashboard client
- **Vue d'ensemble** : Salutation personnalisée avec nom du client
- **Cartes de comptes** : Carrousel permettant de naviguer entre les comptes avec flèches précédent/suivant
  - Chaque carte affiche le solde, le titulaire et les 4 derniers chiffres de l'IBAN
  - Couleurs différentes pour chaque carte
  - Pagination (ex: 1/3)
- **Statistiques** : Solde principal, Dépenses (30j), Revenus (30j)
- **Historique d'activité** : Liste chronologique des actions (création/suppression de comptes)
- **Actions rapides** : Virement, Infos compte, Nouveau compte, Relevé
- **Transactions récentes** : Liste avec montants colorés (rouge pour dépenses, vert pour revenus)
- **Popup d'informations** : Modal affichant IBAN, solde, type de compte avec possibilité de copier l'IBAN

## 🛠 Technologies utilisées

### Backend
- **Node.js** avec **Express** (v5.1.0) - Framework web
- **TypeScript** (v5.9.3) - Langage de programmation typé
- **Clean Architecture** - Séparation en couches (Domain, Application, Infrastructure, Interface)
- **JWT** (jsonwebtoken) - Authentification par tokens
- **bcryptjs** - Hashage des mots de passe
- **nodemailer** - Envoi d'emails de confirmation
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **Next.js 15** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 3** - Framework CSS utility-first
- **Context API** - Gestion d'état global (Auth, Toast)

### Architecture
- **Clean Architecture** - Séparation des responsabilités
- **Use Cases** - Logique métier isolée
- **Repositories** - Abstraction de l'accès aux données
- **Dependency Injection** - Inversion de dépendances

## 🏗 Architecture du projet

Le projet suit les principes de la Clean Architecture avec une séparation claire en 4 couches :

```
src/
├── domain/                 # Couche domaine (règles métier)
│   ├── entities/          # Entités métier (Client, Account)
│   └── value-objects/     # Objets valeur (IBAN)
├── application/           # Couche application (cas d'usage)
│   ├── use-cases/         # Cas d'usage métier
│   ├── repositories/      # Interfaces de repositories
│   └── services/          # Interfaces de services
├── infrastructure/         # Couche infrastructure (implémentations)
│   ├── adapters/          # Implémentations concrètes
│   │   └── in-memory/     # Repositories en mémoire
│   └── services/          # Services externes (Email)
└── interface/             # Couche interface (API, UI)
    ├── controllers/       # Contrôleurs Express
    └── nest/              # Point d'entrée serveur
```

### Principes respectés

1. **Dependency Rule** : Les dépendances pointent vers l'intérieur (Domain ← Application ← Infrastructure ← Interface)
2. **Indépendance des frameworks** : Le domaine ne dépend d'aucun framework
3. **Testabilité** : Chaque couche peut être testée indépendamment
4. **Indépendance de la base de données** : Les repositories sont abstraits, facilement remplaçables

### Flux de données

```
User Action → Interface (Controller) → Use Case → Repository → Entity → Response
```

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Configuration

1. **Cloner le repository**
```bash
git clone <repository-url>
cd Clean-architecture
```

2. **Installer les dépendances backend**
```bash
npm install
```

3. **Installer les dépendances frontend**
```bash
cd frontend
npm install
cd ..
```

4. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :
```env
# Backend
PORT=4000
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRES_IN=1d
FRONT_ORIGIN=http://localhost:3001

# Email (optionnel en dev)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre_email@example.com
SMTP_PASS=votre_mot_de_passe
FRONTEND_BASE_URL=http://localhost:3001
APP_BASE_URL=http://localhost:4000
```

Créer un fichier `frontend/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Lancement en développement

**Terminal 1 - Backend** (à la racine du projet) :
```bash
PORT=4000 FRONT_ORIGIN=http://localhost:3001 npm run dev
```

Le serveur backend sera accessible sur `http://localhost:4000`

**Terminal 2 - Frontend** (dans le dossier frontend) :
```bash
cd frontend
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000` (ou 3001 si 3000 est occupé)

### Lancement en production

**Backend** :
```bash
npm run build
npm start
```

**Frontend** :
```bash
cd frontend
npm run build
npm start
```

## 📋 Fonctionnalités

### Authentification
- ✅ Inscription avec validation de mot de passe
- ✅ Confirmation par email
- ✅ Connexion avec JWT
- ✅ Déconnexion
- ✅ Persistance de session

### Gestion de comptes
- ✅ Création de comptes multiples
- ✅ Visualisation des comptes avec cartes stylisées
- ✅ Navigation entre comptes (carrousel)
- ✅ Suppression de comptes
- ✅ Affichage du solde par compte
- ✅ Affichage de l'IBAN avec copie en un clic

### Interface utilisateur
- ✅ Design moderne avec thème sombre et accents néon
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Modals interactifs
- ✅ Historique d'activités persistant

## 📚 Structure du projet

### Backend

```
src/
├── domain/
│   ├── entities/
│   │   ├── Client.ts          # Entité Client
│   │   └── Account.ts         # Entité Account
│   └── value-objects/
│       └── IBAN.ts           # Objet valeur IBAN
├── application/
│   ├── use-cases/
│   │   ├── RegisterClient.ts
│   │   ├── ConfirmRegistration.ts
│   │   ├── LoginClient.ts
│   │   ├── CreateAccount.ts
│   │   ├── CloseAccount.ts
│   │   └── RenameAccount.ts
│   ├── repositories/
│   │   ├── ClientRepository.ts
│   │   └── AccountRepository.ts
│   └── services/
│       └── EmailService.ts
├── infrastructure/
│   ├── adapters/in-memory/
│   │   ├── InMemoryClientRepo.ts
│   │   └── InMemoryAccountRepo.ts
│   └── services/
│       └── EmailService.ts    # Implémentation réelle/Dev
└── interface/
    ├── controllers/
    │   ├── ClientController.ts
    │   └── AccountController.ts
    └── nest/
        └── main.ts            # Point d'entrée Express
```

### Frontend

```
frontend/src/
├── app/
│   ├── components/
│   │   └── Header.tsx        # Composant header avec auth
│   ├── confirm/
│   │   └── [token]/
│   │       └── page.tsx       # Page de confirmation
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard principal
│   ├── login/
│   │   └── page.tsx          # Page de connexion
│   ├── register/
│   │   ├── page.tsx          # Page d'inscription
│   │   └── sent/
│   │       └── page.tsx      # Confirmation inscription
│   ├── styles/
│   │   └── globals.css       # Styles globaux
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Page d'accueil
├── contexts/
│   ├── AuthContext.tsx       # Contexte d'authentification
│   └── ToastContext.tsx      # Contexte de notifications
└── lib/
    └── api.ts                # Client API
```

## 🔌 Endpoints API

### Authentification
- `POST /clients/register` - Inscription d'un nouveau client
- `POST /clients/login` - Connexion
- `GET /clients/confirm/:token` - Confirmation d'inscription
- `GET /clients/:id` - Récupération d'un client

### Comptes
- `POST /accounts` - Création d'un compte
- `GET /accounts?clientId=...` - Liste des comptes d'un client
- `GET /accounts/:clientId/balance` - Solde d'un compte
- `GET /accounts/:clientId/iban` - IBAN d'un compte
- `PATCH /accounts/:id` - Renommer un compte
- `DELETE /accounts/:id` - Supprimer un compte

## 🎨 Design System

### Couleurs
- **Primary** : `#b8ff3d` (Vert néon)
- **Accent** : `#00ffa3` (Turquoise)
- **Background** : `#0b0f14` (Fond sombre)
- **Card** : `#0f141a` (Surface de carte)
- **Text** : `#e6f1ff` (Texte principal)

### Composants réutilisables
- `.btn-primary` - Bouton principal (vert néon)
- `.btn-secondary` - Bouton secondaire (bordure)
- `.card` - Carte avec ombre et bordure
- `.alert` - Alertes (succès/erreur)
- `.input-minimal` - Champs de formulaire minimalistes

## 📝 Notes de développement

- Le projet utilise un repository **in-memory** pour le développement (les données sont perdues au redémarrage)
- Les emails sont simulés en développement si les credentials SMTP ne sont pas configurés
- L'historique d'activités est stocké dans `localStorage` côté frontend
- Le token JWT est stocké dans `localStorage` et persiste entre les sessions

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Validation des mots de passe côté client et serveur
- Tokens JWT pour l'authentification
- Protection CORS configurée
- Validation des données d'entrée

## 📄 Licence

Ce projet est un projet éducatif développé dans le cadre d'un cours sur l'architecture logicielle.

---

**Développé avec ❤️ en suivant les principes de Clean Architecture**
