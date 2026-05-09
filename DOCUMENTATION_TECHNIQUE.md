# 🕌 Responsabilités des Fichiers - Ikadeen Admin Dashboard

Ce document résume le rôle et la responsabilité de chaque fichier au sein de l'application.

---

## 📁 Racine du Projet
- `angular.json` : Configuration globale du framework Angular.
- `package.json` : Gestion des dépendances, scripts npm et métadonnées du projet.
- `tsconfig.json` : Configuration du compilateur TypeScript.
- `proxy.conf.json` : Configuration du proxy pour rediriger les appels API vers le serveur backend.

## 📁 Source (`src/`)
- `main.ts` : Point d'entrée principal qui démarre l'application Angular.
- `styles.css` : Styles globaux et définition des variables de thèmes (Normal, Dark, Light).
- `index.html` : Page HTML principale servant de squelette à l'application.

## 📁 Application (`src/app/`)
- `app.ts` : Composant racine de l'application.
- `app.config.ts` : Configuration des services essentiels (Routage, Client HTTP).
- `app.routes.ts` : Définition de la navigation et des accès aux composants.
- `app.html` : Template principal contenant le point d'insertion des routes.
- `app.css` : Styles spécifiques au composant racine.

## 📁 Services (`src/app/services/`)
- `auth.ts` : Gestion de la logique d'authentification et du stockage des sessions.

## 📁 Guards (`src/app/guards/`)
- `auth-guard.ts` : Protection des routes pour restreindre l'accès aux utilisateurs connectés.

## 📁 Composants (`src/app/components/`)

### 🔑 Login
- `login.ts` : Gestion de la logique du formulaire et de la soumission de connexion.
- `login.html` : Structure de l'interface de connexion premium.
- `login.css` : Styles visuels spécifiques à la page de connexion.

### 📊 Dashboard
- `dashboard.ts` : Contrôle de l'interface d'administration (thèmes, menu, déconnexion).
- `dashboard.html` : Structure du tableau de bord et des widgets de données.
- `dashboard.css` : Mise en page et design des éléments du tableau de bord.

---
*Dernière mise à jour : Mai 2026*
