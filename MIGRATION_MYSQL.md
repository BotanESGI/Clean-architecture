# Migration vers MySQL - Guide d'installation

## 📋 Prérequis

1. **MySQL installé** sur votre machine
   - Télécharger depuis [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - Ou utiliser Docker: `docker run --name mysql-avenir -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=banque_avenir -p 3306:3306 -d mysql:8`

## 🔧 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la base de données

Ajouter ces variables dans votre fichier `.env` à la racine :

```env
# Configuration MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=banque_avenir
```

### 3. Créer la base de données

**Option A : Script SQL**
```bash
mysql -u root -p < database.sql
```

**Option B : Manuellement**
```sql
CREATE DATABASE banque_avenir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Option C : TypeORM synchronise automatiquement**
- Si `synchronize: true` est activé dans `database.ts`, TypeORM créera les tables automatiquement au démarrage

### 4. Démarrer le serveur

```bash
npm run dev
```

Vous devriez voir :
```
✅ Base de données MySQL connectée
📊 Base de données: banque_avenir
🚀 Serveur lancé sur http://localhost:4000
```

## ✅ Vérification

1. Tester l'endpoint de santé : `curl http://localhost:4000/health`
2. S'inscrire : le lien de confirmation s'affichera dans la console du backend
3. Vérifier dans MySQL : `SELECT * FROM clients;`

## 🔗 Lien de confirmation

Lors de l'inscription, le lien de confirmation s'affichera dans la console backend :

```
================================================================================
🔗 LIEN DE CONFIRMATION (copiez ce lien dans votre navigateur)
================================================================================
Email: test@example.com
Lien: http://localhost:3000/confirm/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
================================================================================
```

Copiez ce lien et ouvrez-le dans votre navigateur pour confirmer le compte.

## 📝 Notes

- Les données sont maintenant persistantes dans MySQL
- TypeORM synchronise automatiquement le schéma (en développement)
- En production, désactiver `synchronize` et utiliser des migrations

