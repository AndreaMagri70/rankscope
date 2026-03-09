# ◈ RankScope — SEO Rank Checker per Google.it

Verifica il posizionamento del tuo sito su Google.it per le tue parole chiave.
Progetto Next.js fullstack: il frontend chiama un'API Route locale che contatta SerpAPI lato server (niente più problemi CORS!).

---

## 🚀 Installazione e avvio

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura la tua API Key
```bash
cp .env.local.example .env.local
```
Apri `.env.local` e sostituisci `inserisci_qui_la_tua_api_key` con la tua chiave SerpAPI.

### 3. Avvia il server di sviluppo
```bash
npm run dev
```

### 4. Apri nel browser
```
http://localhost:3000
```

---

## 🔑 Ottenere la SerpAPI Key

1. Vai su https://serpapi.com e registrati (è gratuito)
2. Il piano **free** include 100 ricerche/mese
3. Copia la tua API Key dalla dashboard
4. Incollala nel file `.env.local`

---

## 📁 Struttura del progetto

```
rankscope/
├── src/
│   └── app/
│       ├── api/
│       │   └── rank/
│       │       └── route.ts     ← API Route (lato server, niente CORS)
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx             ← Interfaccia utente
├── .env.local                   ← API Key (NON condividere questo file!)
├── .env.local.example
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## ⚙️ Come funziona

1. Il browser invia la keyword e l'URL a `/api/rank` (rotta locale Next.js)
2. Il server Next.js contatta SerpAPI con la tua key (nessun CORS!)
3. Analizza i primi 100 risultati di Google.it cercando il tuo dominio
4. Restituisce posizione, URL, titolo e snippet

---

## 🌐 Deploy su Vercel (opzionale)

```bash
npm install -g vercel
vercel
```

Aggiungi `SERPAPI_KEY` come variabile d'ambiente nel pannello Vercel.

---

## 📦 Build di produzione

```bash
npm run build
npm start
```
