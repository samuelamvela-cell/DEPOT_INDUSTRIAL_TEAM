# AgroPredict — Documentation Complète du Projet

**Application d'Aide à la Décision Agronomique & Climat-Intelligente**  
*Fondée sur l'Observation Spatiale de la Terre (NASA) & la Recherche Agronomique Camerounaise (IRAD)*

---

## 1. Vue d'Ensemble & Vision Produit

### 1.1 Contexte & Problématique
En Afrique subsaharienne francophone, notamment au Cameroun (zones forestière bimodale du Centre, hauts plateaux de l'Ouest, savanes), les petits producteurs vivriers et leurs conseillers de terrain font face à une variabilité accrue des cycles pluviométriques. Les dates de début et de fin de mousson se décalent, les poches de sécheresse intra-saisonnières (notamment la pause estivale de juillet-août) menacent la floraison des céréales, et l'appauvrissement minéral des sols ferrallitiques nécessite une gestion rationnelle des successions culturales.

### 1.2 Mission d'AgroPredict
**AgroPredict** démocratise l'accès à la télédétection satellitaire de pointe sans nécessiter de capteurs au sol onéreux. L'application transforme des pétaoctets de données d'observation spatiale (précipitations, humidité du sol, température, rayonnement, indice de végétation) en **itinéraires techniques de rotation des cultures concrets, rentables en FCFA et agronomiquement résilients**.

### 1.3 Cibles Utilisateurs
1. **Petits Exploitants Agricoles Vivriers (Cœur de cible)** : Parcelles de 0,5 à 5 hectares, cultures combinées (maïs, niébé, manioc, arachide, soja, maraîchage). Recherche de sécurité alimentaire et maximisation de la marge nette.
2. **Conseillers Agricoles de Secteur & Vulgarisateurs (MINADER, Coopératives, ONG)** : Suivi de cohortes paysannes (ex. 30 à 60 fermes par conseiller), besoin de diagnostics rapides sur smartphone ou tablette en zone rurale.
3. **Chercheurs & Agronomes (IRAD, Universités)** : Étalonnage des coefficients culturaux ($K_c$), validation des modèles de stress hydrique et capitalisation locale.

---

## 2. Système de Design & Identité Visuelle

Le système de design **AgroPredict System** a été conçu pour inspirer la rigueur scientifique tout en restant accessible, chaleureux et adapté aux conditions de forte luminosité sur le terrain.

### 2.1 Palette de Couleurs & Tokens Sémantiques

| Rôle / Token | Code Hex | Usage Principal |
| :--- | :--- | :--- |
| **Vert Forêt Principal** | `#1F6B3A` | Actions majeures (CTA), éléments d'ancrage, navigation active, marque |
| **Vert Végétal Clair** | `#4CAF6A` | Succès, indicateurs positifs, azote régénéré, score agronomique |
| **Ocre Doré Terreux** | `#E0A526` | Scénario recommandé (Badge "Or"), alertes d'attention, semis optimal |
| **Brun Terre Tropicale** | `#7A5230` | Pédologie, profil de sol ferrallitique, antécédents culturaux |
| **Bleu Spatial NASA** | `#1E5FA8` | Flux satellitaires, télémesures, radar micro-ondes, liens de transparence |
| **Surface Chaude Naturelle** | `#F7F8F3` | Arrière-plan global, réduit la fatigue oculaire sous fort ensoleillement |
| **Surface Blanche Conteneur**| `#FFFFFF` | Cartes d'indicateurs, panneaux modulaires, dialogues |
| **Texte Sombre Anthracite** | `#1B2A22` | Typographie principale, contraste conforme WCAG AA+ |
| **Texte Secondaire Olive** | `#5B6B62` | Légendes, métadonnées, dates et résolutions satellitaires |
| **Alerte Risque Sévère** | `#D64545` | Stress hydrique critique, alerte avortement floraison, bio-agresseurs |

### 2.2 Typographie & Échelle de Texte
- **Titres & Display** : `Plus Jakarta Sans` (Poids : Semi-Bold 600, Bold 700). Rigueur géométrique moderne.
- **Corps de texte & Chiffres** : `Inter` (Poids : Regular 400, Medium 500). Lisibilité maximale sur petits écrans tactiles, avec tabular nums pour les matrices chiffrées en FCFA.
- **Taille minimale du corps** : `16px` pour éviter tout déchiffrage difficile en plein champ.

### 2.3 Principes Ergonomiques & Contraintes Terrain
- **Cibles tactiles minimales** : `48px x 48px` minimum sur tous les boutons, sélecteurs et onglets.
- **Fonctionnement Hors-Ligne & Bas Débit (2G/3G)** : 
  - Stockage local en cache PWA (~15 Mo pour les matrices communales de la Lékié).
  - Suppression automatique des tuiles cartographiques lourdes en mode économie de bande passante au profit de vecteurs géométriques légers.
- **Double encodage de l'information** : Une couleur d'alerte est systématiquement doublée d'un pictogramme textuel et d'une étiquette explicite.

---

## 3. Données Scientifiques & Chaîne de Traitement NASA / IRAD

### 3.1 Constellations Satellitaires Mobilisées
1. **NASA GPM IMERG (Integrated Multi-satellitE Retrievals for GPM)** :
   - *Rôle* : Précipitations estimées toutes les 30 minutes, historiques continus sur 20 ans (2004–2024).
   - *Résolution* : $0.1^\circ$ (~10 km), recalibrée par downscaling topographique à 10 m grâce au modèle SRTM.
2. **NASA SMAP (Soil Moisture Active Passive)** :
   - *Rôle* : Humidité volumétrique des sols superficiels (0–5 cm) et racine utile (RU) par radar micro-ondes bande L (pénètre le couvert forestier).
   - *Fréquence* : Relecture tous les 2 à 3 jours.
3. **NASA POWER (Prediction of Worldwide Energy Resources)** :
   - *Rôle* : Température de l'air à 2 m, insolation globale, degrés-jours de croissance (GDD) et évapotranspiration de référence ($ET_0$ Penman-Monteith).
4. **MODIS & Sentinel-2** :
   - *Rôle* : Indice NDVI (Normalised Difference Vegetation Index), biomasse foliaire et suivi de la sénescence.

### 3.2 La Chaîne "Du Pixel au Conseil Agricole"
```
[ NASA IMERG / SMAP / POWER ] 
             │ (Flux ouverts quotidiens HDF5/GeoTIFF)
             ▼
[ 1. Ingestion & Correction Barycentrique ] 
             │ (Masquage nuageux équatorial, recalage relief SRTM)
             ▼
[ 2. Modélisation Agronomique IRAD ] 
             │ (Croisement avec sols ferrallitiques + coefficients culturaux Kc)
             ▼
[ 3. Moteur Probabiliste de Rotation ] 
             │ (Indice de résilience /100, calcul marge nette FCFA/ha)
             ▼
[ 4. Conseil Paysan Vulgarisé ] 
             │ (Date clé de semis, prévision pause sèche, sécurité alimentaire)
```

---

## 4. Spécifications des Fonctionnalités & Cartographie des Écrans

Le projet intègre une parité complète entre version **Desktop (1440px)** et version **Mobile (390px)**, totalisant **20 écrans livrés**.

### 4.1 Onboarding & Accueil
* **Écran 1 (Desktop) / Écran 1' (Mobile) : Bienvenue & Onboarding**
  - Sensibilisation aux 3 piliers : capteurs spatiaux sans matériel coûteux, simulateur de rotation anti-épuisement, rentabilité chiffrée en FCFA.
  - Parcours en 3 temps : Délimiter $\rightarrow$ Choisir ses cultures $\rightarrow$ Obtenir la meilleure rotation.
  - Prise en charge des zones blanches (PWA pré-synchronisée).

* **Écran 2 (Desktop) / Écran 2' (Mobile) : Tableau de bord Exploitation**
  - Cockpit d'accueil contextualisé pour le conseiller ou exploitant (Ex: Michel Ngoa, secteur d'Obala).
  - Mini-station hydro-climatique virtuelle en direct (pluie sur 7j vs normale 10 ans, humidité SMAP 68%).
  - Synthèse vulgarisée ("Conditions optimales de semis vendredi matin").
  - Alerte précoce sur la date de clôture de mousson et accès direct aux 3 actions majeures.

### 4.2 Configuration Pédologique & Analyse Environnementale
* **Écran 3 (Desktop) / Écran 3' (Mobile) : Définir mon Exploitation**
  - Outil cartographique de délimitation polygonale GPS de la parcelle (calcul automatique de la surface en hectares et quarts de piquets).
  - Diagnostic SRTM : pente estimée (4,1%), réserve utile en eau (85 mm/m) et risque d'érosion des sols.
  - Caractérisation pédologique rapide (Sablo-argileux, Latéritique, Argileux, Volcanique).
  - Définition des priorités paysannes (Rendement FCFA, Santé du sol, Résilience sécheresse, Sécurité vivrière).

* **Écran 4 (Desktop) / Écran 4' (Mobile) : Analyse Agro-Climatique**
  - Diagramme pluviométrique bimodal interactif (Petite saison Mars-Juin, Pause sèche Juillet-Août, Grande saison Septembre-Novembre).
  - Détection prédictive de la fenêtre idéale de semis (15 mars $\pm$ 4 jours).
  - Télémétrie de biomasse active (NDVI 0.74, humidité racinaire 34%).
  - Conseil sans jargon rédigé pour le terroir sélectionné.

### 4.3 Bibliothèque de Semences & Constructeur de Scénarios
* **Écran 5 (Desktop) / Écran 5' (Mobile) : Bibliothèque des Cultures**
  - Catalogue des variétés homologuées par l'IRAD : Maïs blanc CMS 8704, Manioc de garde 8034, Arachide locale Lekié, Niébé amélioré, Soja, Tomate plein champ.
  - Fiches détaillées : durée de cycle (jours), besoins en eau (mm cumulés), capacité de fixation biologique de l'azote ($+45\text{ kg N/ha}$).
  - Calendrier phénologique simplifié en 4 phases pour les exploitants.

* **Écran 6 (Desktop) / Écran 6' (Mobile) : Constructeur de Scénarios de Rotation**
  - Timeline pluriannuelle séquentielle sur 3 saisons culturales :
    - *Saison 1* : Céréale vivrière (Maïs blanc 95j).
    - *Inter-saison* : Pause sèche de 35 jours (Recommandation paillage & engrais vert).
    - *Saison 2* : Légumineuse régénératrice (Niébé à cycle court, rupture parasitaire du foreur de tige).
    - *Saison 3* : Tubercule de résilience (Manioc de garde puisant l'eau en profondeur).
  - Bilan instantané en temps réel : Score global, stress hydrique estimé, fertilisation biologique naturelle.

### 4.4 Aide à la Décision, Arbitrage & Détails
* **Écran 7 (Desktop) / Écran 7' (Mobile) : Comparateur & Radar Chart**
  - Module d'ajustement interactif des pondérations ("Ce qui compte pour moi") avec sliders tactiles.
  - Classement hiérarchisé de 3 options :
    1. *Option A (Recommandée - 88/100)* : Maïs $\rightarrow$ Niébé $\rightarrow$ Manioc (Équilibre parfait, marge $1\,450\,000\text{ FCFA/ha}$).
    2. *Option B (Spéculative - 76/100)* : Arachide $\rightarrow$ Maïs $\rightarrow$ Tomate (Fort gain potentiel mais 32% de risque sécheresse).
    3. *Option C (Déconseillée - 54/100)* : Monoculture de Maïs en continu (Perte d'azote $-60\text{ kg/ha}$, risque de chenilles légionnaires).
  - **Radar Chart Pentadimensionnel vectoriel SVG** superposant les 5 critères fondamentaux.
  - Synthèse chiffrée comparative (marge totale de l'exploitation, stress hydrique, journées de travail requises).

* **Écran 8 (Desktop) / Écran 8' (Mobile) : Détail du Scénario & Itinéraire Technique**
  - Décomposition calendaire mois par mois avec photos agronomiques de terrain.
  - Pédagogie de l'algorithme ("Pourquoi 88/100 ?") : adéquation pluie (92%), économie d'engrais minéral (85%), valorisation locale sur les marchés d'Obala et Yaoundé (88%).
  - Encadré déontologique de transparence : *"Les prédictions sont indicatives et basées sur l'historique satellitaire NASA (2004-2024)..."*.
  - Export PDF ultra-léger (<200 Ko) pour partage direct par WhatsApp ou Bluetooth.

### 4.5 Transparence Scientifique & Paramétrage
* **Écran 9 (Desktop) / Écran 9' (Mobile) : Données & Sources Satellitaires**
  - Fiches d'identité méthodologique de chaque capteur (GPM, SMAP, POWER, MODIS).
  - Validation croisée sur les 14 stations pluviométriques de l'IRAD (corrélation de 98.2% mesurée à Nkolbisson).
  - FAQ méthodologique : calcul des marges brutes en FCFA, applicabilité aux parcelles < 1 ha, pérennité du cache PWA.
  - Logos institutionnels et liens vers les portails NASA EarthData et MINADER.

* **Écran 10 (Desktop) / Écran 10' (Mobile) : Profil, Paramètres & Mode Hors-Ligne**
  - Fiche du conseiller agricole référent (Michel Ngoa, matricule IRAD-OB-849, 48 exploitations suivies).
  - Préférences linguistiques (Français / Anglais) et monétaires (FCFA / USD).
  - Unités agronomiques locales (Hectares / Quarts de piquet de $625\text{ m}^2$, Tonnes / Sacs de 100 kg).
  - Gestionnaire de stockage local : 14.8 Mo utilisés sur 128 Mo alloués, bouton de téléchargement du pack Lékié (18 Mo) et purge du cache temporaire.

---

## 5. Synthèse des Écrans du Projet dans le DataStore

| Titre de l'Écran | Device | Identifiant Screen | Identifiant Shell |
| :--- | :--- | :--- | :--- |
| **Bienvenue & Onboarding** | Desktop | `{{DATA:SCREEN:SCREEN_36}}` | `{{DATA:SHELL:SHELL_37}}` |
| **Tableau de bord** | Desktop | `{{DATA:SCREEN:SCREEN_40}}` | `{{DATA:SHELL:SHELL_41}}` |
| **Mon Exploitation** | Desktop | `{{DATA:SCREEN:SCREEN_38}}` | `{{DATA:SHELL:SHELL_39}}` |
| **Analyse Agro-Climatique NASA** | Desktop | `{{DATA:SCREEN:SCREEN_34}}` | `{{DATA:SHELL:SHELL_35}}` |
| **Bibliothèque Cultures** | Desktop | `{{DATA:SCREEN:SCREEN_30}}` | `{{DATA:SHELL:SHELL_31}}` |
| **Scénarios de Rotation** | Desktop | `{{DATA:SCREEN:SCREEN_32}}` | `{{DATA:SHELL:SHELL_33}}` |
| **Comparaison & Décision** | Desktop | `{{DATA:SCREEN:SCREEN_28}}` | `{{DATA:SHELL:SHELL_29}}` |
| **Détail du Scénario** | Desktop | `{{DATA:SCREEN:SCREEN_26}}` | `{{DATA:SHELL:SHELL_27}}` |
| **Données & Sources** | Desktop | `{{DATA:SCREEN:SCREEN_24}}` | `{{DATA:SHELL:SHELL_25}}` |
| **Profil & Paramètres** | Desktop | `{{DATA:SCREEN:SCREEN_22}}` | `{{DATA:SHELL:SHELL_23}}` |
| **Bienvenue & Onboarding Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_18}}` | `{{DATA:SHELL:SHELL_19}}` |
| **Tableau de bord Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_16}}` | `{{DATA:SHELL:SHELL_17}}` |
| **Mon Exploitation Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_10}}` | `{{DATA:SHELL:SHELL_11}}` |
| **Analyse Climatique Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_12}}` | `{{DATA:SHELL:SHELL_13}}` |
| **Bibliothèque Cultures Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_14}}` | `{{DATA:SHELL:SHELL_15}}` |
| **Scénarios de Rotation Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_8}}` | `{{DATA:SHELL:SHELL_9}}` |
| **Comparateur & Radar Chart Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_20}}` | `{{DATA:SHELL:SHELL_21}}` |
| **Détail du Scénario Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_6}}` | `{{DATA:SHELL:SHELL_7}}` |
| **Données & Sources Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_4}}` | `{{DATA:SHELL:SHELL_5}}` |
| **Profil & Paramètres Mobile** | Mobile | `{{DATA:SCREEN:SCREEN_2}}` | `{{DATA:SHELL:SHELL_3}}` |

---

## 6. Guide de Déploiement & Bonnes Pratiques Terrain

1. **Génération PWA & Service Worker** :
   - Mise en cache stricte des fichiers statiques (icônes Lucide, police *Plus Jakarta Sans*, graphes SVG).
   - Synchronisation en tâche de fond (*Background Sync API*) des délimitations parcellaires dès que l'appareil accroche une borne relais 2G/3G ou un point d'accès Wi-Fi coopératif.
2. **Vulgarisation Orale & Rôle du Conseiller** :
   - L'interface évite délibérément les acronymes complexes bruts sans explication : par exemple, le terme "NASA SMAP" est systématiquement couplé à l'expression compréhensible *"Humidité de la terre en profondeur"*.
3. **Respect du Calendrier Pédologique Bimodal** :
   - Les alertes de l'application sont calées sur la double saison camerounaise pour éviter les semis tardifs de fin juin qui conduisent inévitablement à l'avortement des panicules de maïs pendant la coupure d'août.
