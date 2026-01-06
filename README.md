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

<img width="2938" height="1680" alt="image" src="https://github.com/user-attachments/assets/7df5861c-3d83-4d68-8c7e-a39c4a5eed30" />
<img width="2938" height="1680" alt="image" src="https://github.com/user-attachments/assets/03904765-9897-467c-89aa-fed8861397ce" />



### Page de connexion
- Design minimaliste avec formulaire à labels flottants
- Section informative à gauche (sur desktop)
- Validation en temps réel avec messages d'erreur stylisés
- Animation et transitions fluides

  <img width="2938" height="1680" alt="image" src="https://github.com/user-attachments/assets/d1b72623-769a-4e24-8ad5-a85060b3f188" />



### Page d'inscription
- Formulaire multi-champs (Prénom, Nom, Email, Mot de passe)
- Validation côté client et serveur du mot de passe (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
- Page de confirmation après inscription indiquant la vérification email

<img width="2938" height="1680" alt="image" src="https://github.com/user-attachments/assets/9e530e08-cf20-40e4-8593-9aff03d3413c" />


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

<img width="2938" height="1674" alt="image" src="https://github.com/user-attachments/assets/0e714ae9-44d0-445c-91f9-0bd5a5ce0746" />

<img width="2938" height="1680" alt="image" src="https://github.com/user-attachments/assets/fdaabf9d-3900-4261-bb6c-7a333174f8e7" />



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
- Docker
- Git

### Configuration

1. **Cloner le repository**
```bash
git clone <repository-url>
cd Clean-architecture
```

2. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :
```env
# File: .env (backend)
PORT=4000
JWT_SECRET=f3b2c9d8e1a7f6c4b5d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1
JWT_EXPIRES_IN=1d

# CORS / URLs
FRONT_ORIGIN=http://localhost:3000
FRONTEND_BASE_URL=http://localhost:3000
APP_BASE_URL=http://localhost:4000

# SMTP vers MailHog (dans Docker)
SMTP_FROM=no-reply@example.local
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# MySQL
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=clean_architecture_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# DB (backend)
DB_HOST=cleanarch-mysql
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=clean_architecture_db
```

> Pour un déploiement via `docker-compose`, ces valeurs assurent que le backend pointe vers le service MySQL interne (`cleanarch-mysql:3306`) avec l’utilisateur `app_user` et la base `clean_architecture_db`. Vérifiez que votre fichier `.env` contient bien ces clés avant de lancer les conteneurs.

Créer un fichier `frontend/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Lancement en développement

**Terminal** (à la racine du projet) :
```bash
docker-compose up --build
```
- Le serveur backend sera accessible sur `http://localhost:4000`
- Le frontend sera accessible sur `http://localhost:3000`
- Mailhog sera accessible sur `http://localhost:8025`
- Adminer sera accessible sur `http://localhost:8080`

### Configuration pour Adminer
- Système	: MySQL / MariaDB
- Serveur	mysql
- Utilisateur	app_user
- Mot de passe	app_password
- Base de données	clean_architecture_db

## 📋 Fonctionnalités

### Client :
- Authentification : en tant que client, je dois pouvoir m’inscrire sur cette nouvelle plateforme. Je dois pouvoir renseigner mes informations afin de recevoir un lien me permettant de confirmer mon inscription et accéder à mon compte (qui sera automatiquement créé à l’inscription). ✅
- Comptes : en tant que client, je dois pouvoir disposer d’autant de compte que je le souhaite. Ainsi, un nouvel IBAN unique et valide mathématiquement doit être généré chaque fois que je créé un compte. Je dois pouvoir supprimer le compte, et modifier son nom personnalisé si je le souhaite. ✅
- Opérations : en tant que client, je dois pouvoir effectuer des opérations courantes, tel qu’un transfert d’un compte à un autre (uniquement au sein de notre banque). Le solde d’un compte doit refléter la somme des opérations de débit (sortant du compte, entrant dans un autre) et de crédit (entrant vers le compte, en provenance d’un autre compte). ✅
- Épargne: en tant que client, je dois pouvoir ouvrir un compte d’épargne. Celui-ci doit pouvoir me permettre, comme pour un compte, d’effectuer des opérations entrantes et sortantes. Néanmoins, ce dernier sera rémunéré tous les jours, au taux en vigueur (fixé par les administrateurs de la banque).✅
- Investissement : en tant que client, je dois pouvoir enregistrer des ordres d’achat ou de vente d’une action. Une action est un titre financier d’appartenance à une entreprise côté sur un marché financier. La liste des actions disponibles est définie par le directeur de la banque. Le cours est calculé en fonction du prix d’équilibre entre un prix de vente et un prix d’achat, selon le carnet d’ordre global pour une action. Étant donné que nous sommes une banque moderne, nous n’avons pas de frais d’arbitrage. Les seuls frais sont de 1€ à l’achat, comme à la vente.✅
  
### Directeur de banque :
- Authentification : en tant que directeur de banque, je dois pouvoir m’authentifier.✅
- Gestion des comptes : en tant que directeur de banque, je dois pouvoir créer, modifier ou supprimer un compte client ou le bannir.✅
- Fixation du taux d’épargne : en tant que directeur de la banque, je dois pouvoir effectuer une modification du taux d’épargne disponible pour les comptes d’épargne. Ce faisant, tous les clients ayant actuellement un compte d’épargne doivent avoir une notification en ce qui concerne le changement du taux qui a été fixé lors de la modification.✅
- Actions : en tant que directeur de banque, je suis celui qui créé, modifie et supprime les actions. Je n’ai pas la possibilité de modifier le cours d’une action, mais c’est moi qui décide quelles sont les actions disponibles de celles qui ne le sont pas. Les clients sont propriétaires de leur actions, contrairement à certains de nos concurrents qui ne le disent pas, nous l’affichons fièrement.✅
  
### Conseiller de banque :
- Authentification : en tant que conseiller bancaire, je peux m’authentifier. ✅
- Crédit : en tant que conseiller bancaire, je peux être amené à octroyer des crédit. Un crédit a un taux annuel d’intérêts à rembourser sur le capital
restant chaque mois, une assurance (obligatoire) à un taux dont le montant est calculé sur le total du crédit accordé et prélevé sur les mensualités, et des mensualités qui correspondent au montant du crédit remboursé chaque mois. Nous utilisons la méthode de calcul du crédit à mensualité constante.✅
- Messagerie instantannée : en tant que conseiller bancaire, je peux répondre aux messages qui me sont envoyés de la part de mes clients, étant donné que nous sommes une banque moderne, chaque fois qu’un message est envoyé et en attente de réponse, tous les conseiller peuvent le voir, néanmoins à partir du premier message, la discussion est relié au conseiller bancaire qui a répondu en premier au client. En cas de besoin, la discussion peut être transférée d’un conseiller à un autre, auquel cas le transfert de la discussion se fait entre les deux conseillers. (frontend  ✅, backend ❌ )

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

# Sujet NextJS 5IW

## Contexte

Ce sujet permet de rajouter des instructions pour la réalisation du front du projet **Clean Architecture**.  
Ce front sera évalué et servira de note de partiel pour la matière **NextJS**.

---

## Instructions

- Votre application doit respecter une **approche Atomic Design** pour la structure de ses composants.
- Utilisation de **contexte(s)** pour partager des states entre composants. ✅ (AuthContext, ToastContext)
- Gestion des **formulaires avec React Hook Form** et validation avec des **schémas** (ex : *zod*). ✅
- Les pages **404** et **500** doivent être correctement intégrées et respecter la charte graphique de votre application.✅
- Votre application doit être **traduite en français et en anglais**. ✅
- Un fichier **sitemap.xml** doit être accessible pour lister les pages de votre application.✅
- Au moins une **page d'accueil** avec les **metadata correctement intégrées pour le SEO**. ✅
- Votre application doit avoir un **maximum de rendu côté serveur (SSR)**. ✅ (page d'accueil en Server Component)
- Votre application doit être conçue pour utiliser un **maximum de cache**, qu'il soit applicatif ou API. ✅ (`lib/api-cache.ts`, `cachedFetch`)

---

## Bonus

- Cache géré par un **Redis**.  
- **Animations** sur tableaux, cards, listes, etc.
- **Drag'n'Drop** (ex : déplacer de l'argent d'un compte à un autre).

---

# # Sujet Web Temps réel 5IW :

## Introduction

La banque AVENIR (Alliance de Valeurs Économiques et Nationales Investies Responsablement) vous a recruté comme développeur Web afin de pouvoir l'aider à développer son métier et concurrencer les banques traditionnelles afin de pouvoir créer une application Web permettant à ses clients de gérer efficacement leur liquidités, épargne et investissement.

## Fonctionnalités (18 points)

### Client

- **Authentification** : En tant que client, je dois pouvoir m'inscrire sur cette nouvelle plateforme. Je dois pouvoir renseigner mes informations afin de recevoir un lien me permettant de confirmer mon inscription et d'accéder à mon compte (qui sera automatiquement créé à l'inscription). ✅

- **Discussion privée** : En tant que client, je dois pouvoir contacter mon conseiller via message privés en temps réel. ✅

- **Activités et feed** : En tant que client je dois pouvoir, sur mon espace, consulter en temps réel les actualités de ma banque.

### Conseiller de banque

- **Activités** : En tant que conseiller, je dois pouvoir créer une nouvelle actualités consultable par les clients.

- **Notification** : En tant que conseiller, je peux envoyer une notification en temps réel à l'un de mes clients. La notification doit être personnalisée en fonction du besoin.

- **Discussion privée** : En tant que conseiller, je peux répondre aux clients qui m'ont contacter via message privé en temps réel. ✅

### Conseiller de banque et directeur de banque

- **Discussion de groupe** : En tant que conseiller ou directeur, je dois pouvoir communiquer via une discussion de groupe avec tout le monde en temps réel. Le directeur de banque doit se démarquer visuellement dans la conversation.

## Contraintes techniques

1. **Langage** : Développement en TypeScript (backend et frontend).

2. **Web Temps Réel** :
   - Le système de chat doit être réalisé via web socket.
   - Le système de Feed et de notification doit être réalisé via SSE (Server-Sent Events).

3. **Fixtures** : Le projet devra avoir des fixtures et/ou des jeux de données afin de tester rapidement toutes les fonctionnalités.

4. **README** : Le README de votre projet devra contenir les informations suivantes :
   - Le Prénom, NOM et classe de toutes les personnes
   - Toutes les étapes sur comment installer / lancer le projet
   - Toutes les étapes pour avoir des jeux de données et les identifiants d'un compte de test (un compte utilisateur et un compte admin)

## BONUS

- Afficher le statut « En train d'écrire » si un client ou un conseiller est en train d'envoyer un message dans la partie « contacter un conseiller ». ✅
- Faire le lien entre les notifications administrateur et l'API web « notification push ». ✅
