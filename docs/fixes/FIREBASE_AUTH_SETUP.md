# Firebase Authentication Setup för Lokal Utveckling

## Problem
Playwright E2E-tester körs på `localhost:3000`, men Firebase Authentication kräver att domäner är godkända i Firebase Console.

## Lösning: Lägg till localhost som Authorized Domain

### Steg 1: Gå till Firebase Console
1. Öppna [Firebase Console](https://console.firebase.google.com/)
2. Välj ditt projekt: **eltonvanplan**

### Steg 2: Gå till Authentication Settings
1. Klicka på **Authentication** i vänstermenyn
2. Klicka på fliken **Settings**
3. Scrolla ner till **Authorized domains**

### Steg 3: Lägg till localhost
1. Klicka på **Add domain**
2. Skriv in: `localhost`
3. Klicka **Add**

### Alternativt via Firebase CLI:

```bash
# 1. Installera Firebase CLI (om du inte har det)
npm install -g firebase-tools

# 2. Logga in
firebase login

# 3. Välj ditt projekt
firebase use eltonvanplan

# 4. Lista nuvarande authorized domains
firebase auth:export domains.json

# 5. Lägg till localhost manuellt i domains.json, sedan:
# (OBS: Det finns ingen direkt CLI-kommando för att lägga till domains)
# Detta måste göras via Console eller REST API
```

## Verifiering

Efter att ha lagt till `localhost`:

1. Kör testerna:
```bash
npm run test:e2e
```

2. Testerna ska nu kunna autentisera utan problem!

## För CI/CD (GitHub Actions, etc.)

Om du kör tester i CI/CD, behöver du också lägga till:
- `127.0.0.1` (om CI använder IP istället för localhost)
- Din CI-miljös domän (t.ex. `github.dev` för GitHub Codespaces)

## Nuvarande Authorized Domains

Din Firebase är konfigurerad med:
- ✅ `eltonvanplan.firebaseapp.com` (standard)
- ❓ `localhost` (lägg till denna!)

## Säkerhet

**Är det säkert att lägga till localhost?**
- ✅ Ja! `localhost` kan bara nås från din egen dator
- ✅ Det är standard praxis för utveckling
- ✅ Production Firebase projekts har ofta både prod-domänen OCH localhost

## Alternativ (Om du vill ha separata miljöer)

### Option A: Skapa Test Firebase Project
```bash
# Skapa nytt projekt: eltonvanplan-test
# Konfigurera med localhost från början
# Använd .env.test för test credentials
```

### Option B: Firebase Emulator Suite
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Då körs allt lokalt utan att behöva prod Firebase!

## Nästa Steg

Efter att ha lagt till `localhost` i Firebase Console:

1. ✅ Kör `npm run test:e2e` - ska fungera!
2. ✅ Tester kan köras när du vill utan att oroa dig för auth
3. ✅ CI/CD kommer också fungera (om du lägger till CI-domänen)

## Troubleshooting

**Fel: "auth/unauthorized-domain"**
- Lösning: Verifiera att `localhost` är i Authorized domains listan

**Fel: Tester timeout**
- Lösning: Kolla att dev server körs på rätt port (3000)
- Verifiera med: `curl http://localhost:3000`

**Fel: "No user logged in"**
- Lösning: Testerna förväntar sig att demo-projektet är tillgängligt
- Alternativt: Logga in manuellt en gång i webbläsaren först
