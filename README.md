# RobloxIA Studio : site indépendant

Un site à toi, avec son propre serveur. L'IA est Claude, appelée via ta clé API (elle reste côté serveur).

## Lancer chez toi
1. Installe Node.js 20.6 ou plus récent.
2. Copie `.env.example` en `.env` et mets ta clé : https://console.anthropic.com
3. `npm run dev` puis ouvre http://localhost:3000

## Mettre en ligne
Sur Render, Railway ou Fly.io : crée un « Web Service » Node avec la commande `npm start`
et ajoute la variable d'environnement `ANTHROPIC_API_KEY`. Tu obtiens une adresse publique.
(Vercel/Netlify ne conviennent pas tels quels : il faudrait adapter `server.js` en fonction serverless.)
Attention : chaque message envoyé sur ton site est facturé sur ta clé API. Une limite de 20 demandes / 10 min par visiteur est incluse.

## Le bouton « Télécharger le plugin »
1. Dans Studio : sauvegarde `public/IAStudio.server.lua` dans un Script, puis clic droit → **Publish as Plugin**.
   Nom : `IA Roblox Studio`. Coche « Distribute on Creator Store ».
2. Récupère le numéro dans l'adresse de la page du plugin : `create.roblox.com/store/asset/NUMERO`.
3. Dans `public/index.html`, remplis `PLUGIN_ASSET_ID = "NUMERO"`.
   Le bouton ouvre alors directement la page du plugin avec son nom.
