# Planning Admin Web — IKA DEEN P1

> Dernière mise à jour : mai 2026  
> Légende : ✅ fait · 🔄 en cours · ⏳ à faire · 🔌 besoin API backend

---

## Phase 1 — Consolidation (en cours)

| # | Tâche | Statut |
|---|--------|--------|
| 1.1 | Stats plateforme réelles (`/dashboard/stats`) | 🔄 |
| 1.2 | Accueil : retirer données fictives (dons, feedback, forage) | 🔄 |
| 1.3 | Corriger thème `localStorage` (`ika_theme`) | 🔄 |
| 1.4 | Imports `environment` (prod/dev via file replacement) | 🔄 |
| 1.5 | Page Validation (squelette UI) | 🔄 |

---

## Phase 2 — Compléter S2 (utilisateurs)

| # | Tâche | Statut | API requise |
|---|--------|--------|-------------|
| 2.1 | Créer un utilisateur depuis l’admin | ⏳ | `POST /api/v1/admin/utilisateurs` ? |
| 2.2 | Éditer email / téléphone / rôle | ⏳ | `PUT /api/v1/admin/utilisateurs/{id}` ? |

---

## Phase 3 — Compléter S3 (médias)

| # | Tâche | Statut | API requise |
|---|--------|--------|-------------|
| 3.1 | Publicités : liste **toutes** (actives + inactives) | ⏳ | `GET /api/v1/publicites` (admin) |
| 3.2 | Publicités : toggle actif/inactif | ⏳ | `PATCH /api/v1/publicites/{id}/status` |
| 3.3 | Publicités : édition | ⏳ | `PUT` multipart ou JSON ? |
| 3.4 | Radios : édition | ⏳ | `PUT /api/v1/radios/{id}` |
| 3.5 | Événements globaux (optionnel) | ⏳ | `GET /api/v1/evenements` admin ? |

---

## Phase 4 — S4 (validation + finalisation)

| # | Tâche | Statut | API requise |
|---|--------|--------|-------------|
| 4.1 | Module **Validation contenus** | 🔄 squelette | Voir section ci-dessous |
| 4.2 | Stats avancées (graphiques, période) | ⏳ | `GET /api/v1/admin/stats` ? |
| 4.3 | Duas / Calendriers (admin) | ⏳ | Endpoints S3 backend |
| 4.4 | Tests + build prod + README | ⏳ | — |

---

## 🔌 Endpoints à confirmer côté backend

### Validation contenus (priorité S4)

```
GET    /api/v1/admin/validations/pending     → liste contenus en attente
GET    /api/v1/admin/validations/{id}        → détail
POST   /api/v1/admin/validations/{id}/approve
POST   /api/v1/admin/validations/{id}/reject  (+ motif optionnel ?)
```

Types de contenus attendus : mosquée proposée, avis, signalement, etc. (à préciser).

### Stats admin (optionnel, pour graphiques)

```
GET /api/v1/admin/stats
→ { totalUsers, activeUsers, newUsersThisMonth, totalMosquees, totalEvents, totalPublicites, ... }
```

Sans cet endpoint, le front agrège les `GET` existants (users, mosquees, publicites/active, radios).

### Publicités admin

```
GET   /api/v1/publicites          → toutes (ADMIN)
PATCH /api/v1/publicites/{id}/toggle
```

---

## Déjà livré

- Login ADMIN + JWT + guards
- CRUD mosquées (+ carte, uploads, événements par mosquée)
- Gestion utilisateurs (liste, statut, suppression)
- Publicités (création, liste actives, suppression)
- Radios (création, liste, suppression)
