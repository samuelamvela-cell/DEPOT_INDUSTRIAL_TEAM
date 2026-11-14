# AgroPredict — Plateforme d'Aide à la Décision Agronomique (NASA / IRAD)

> **Projet :** AgroPredict — Application web d'aide à la décision comparant des scénarios de rotation de cultures vivrières au Cameroun à partir de données d'observation spatiale de la Terre (NASA POWER, IMERG, SMAP, MODIS) et des coefficients agronomiques locaux (IRAD).

---

## 1. Stack Technique

- **Framework :** [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`)
- **Build tool :** [Vite](https://vitejs.dev/) + [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (mode hors-ligne & mise en cache PWA)
- **Gestion d'état :** [Pinia](https://pinia.vuejs.org/)
- **Routage :** [Vue Router 4](https://router.vuejs.org/)
- **Design System & CSS :** [Tailwind CSS](https://tailwindcss.com/) avec tokens fidèles aux maquettes Google Stitch & Material Design 3
- **Typographie :** *Plus Jakarta Sans* (titres & display) et *Inter* (corps $\ge 16\text{px}$, chiffres tabulaires)
- **Typage :** TypeScript strict (aucun `any`)
- **Monnaie :** FCFA (XAF)
- **Cible territoriale :** Département de la Lékié, Obala, Yaoundé (Cameroun, Zone Forestière Bimodale)

---

## 2. Architecture du Projet

```text
stitch_agropredict_crop_rotation_platform/
├── src/
│   ├── assets/
│   │   └── main.css             # Directives Tailwind, styles globaux, safe areas
│   ├── components/
│   │   ├── common/              # Composants réutilisables du Design System
│   │   │   ├── AppBadge.vue     # Badges satellites NASA, alertes et statuts
│   │   │   ├── AppButton.vue    # Boutons primaire, secondaire, reco, outline (min 48px)
│   │   │   ├── AppCard.vue      # Conteneurs et cartes avec élévations diffuses
│   │   │   ├── AppGauge.vue     # Jauge radiale SVG pour score de résilience /100
│   │   │   ├── AppModal.vue     # Dialogue modal accessible
│   │   │   └── AppTabs.vue      # Sélecteur à onglets horizontaux tactiles
│   │   └── layout/
│   │       ├── AppBottomNav.vue # Barre d'onglets mobile (fixed bottom-0, pb-safe)
│   │       ├── AppHeader.vue    # En-tête avec parcelle active et profil conseiller
│   │       └── AppSidebar.vue   # Barre latérale desktop fixe (w-72)
│   ├── data/
│   │   └── mockData.ts          # Mocks typés : parcelles, cultures IRAD, télémétrie NASA
│   ├── router/
│   │   └── index.ts             # 10 routes complètes (Desktop & Mobile-first)
│   ├── services/
│   │   ├── scoringEngine.ts     # Moteur agronomique pur de scoring /100
│   │   └── testScoring.ts       # Tests unitaires des règles agronomiques
│   ├── stores/
│   │   ├── appStore.ts          # Paramètres : langue (FR/EN), devises, mode hors-ligne
│   │   └── farmStore.ts         # Parcelle active, scénarios, pondérations, filtres
│   ├── types/
│   │   └── index.ts             # Interfaces TypeScript strictes
│   ├── views/                   # 10 vues implémentées
│   │   ├── ClimateView.vue      # Analyse agro-climatique & diagramme bimodal
│   │   ├── CropsView.vue        # Bibliothèque variétale IRAD & filtres
│   │   ├── DashboardView.vue    # Tableau de bord d'accueil contextualisé
│   │   ├── DecisionView.vue     # Comparateur multicritère & Radar Chart pentagonal SVG
│   │   ├── FarmView.vue         # Délimitation GPS polygonale & pédologie
│   │   ├── OnboardingView.vue   # Onboarding 3 piliers & carousel pédagogique
│   │   ├── ProfileView.vue      # Profil conseiller, devises & stockage hors-ligne PWA
│   │   ├── ScenarioDetailView.vue # Itinéraire calendaire détaillé & mention légale
│   │   ├── ScenariosView.vue    # Constructeur de rotations sur 3 saisons
│   │   └── SourcesView.vue      # Fiches constellations NASA & stations sol IRAD
│   ├── App.vue                  # Layout adaptatif (sidebar desktop / tabbar mobile)
│   └── main.ts                  # Point d'entrée Vue + Pinia + Router
├── DESIGN.md                    # Spécifications visuelles & tokens de design
├── documentation_complète_agropredict.md # Documentation scientifique NASA / IRAD
├── index.html                   # Shell HTML avec Google Fonts & Material Symbols
├── package.json                 # Dépendances & scripts npm
├── postcss.config.js
├── tailwind.config.js           # Configuration exhaustive des tokens
├── tsconfig.json
└── vite.config.ts               # Configuration Vite + Plugin PWA
```

---

## 3. Règle Déontologique Fondamentale

Chaque vue et résultat chiffré intègre obligatoirement la mention :  
> **« Estimation indicative, pas une prévision de rendement. »**

---

## 4. Démarrage Rapide

Dès que Node.js (v20+ LTS recommandé) est installé :

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement Vite
npm run dev

# Construction pour la production avec PWA
npm run build
```
