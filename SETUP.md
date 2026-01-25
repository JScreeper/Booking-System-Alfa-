# Setup Vodič (Srpski)

## 🎯 Brzi odgovori na česta pitanja:

### 1. **Da li treba da skidam SQLite?**
**NE!** ❌ SQLite dolazi automatski sa Prisma. Nema potrebe za instalacijom - sve radi automatski!

### 2. **Kako da napravim JWT secret?**
Imaš 3 opcije:

**Opcija 1: Automatski (preporučeno)**
```bash
cd backend
npm run generate:secrets
```
Ovo će ti generisati 2 sigurna secret-a koje samo kopiraš u `.env` fajl.

**Opcija 2: Ručno**
Otvori `.env` fajl i ukucaj bilo koji random string (najmanje 32 karaktera):
```env
JWT_SECRET=moj-super-tajni-kljuc-12345-xyz
JWT_REFRESH_SECRET=moj-drugi-tajni-kljuc-67890-abc
```

**Opcija 3: Online generator**
Možeš koristiti bilo koji online random string generator.

## 📝 Korak-po-korak Setup

### Korak 1: Backend

```bash
cd backend

# Instaliraj sve pakete
npm install

# Generiši JWT secret-e
npm run generate:secrets

# Kopiraj output u .env fajl
# Kreiraj .env fajl (kopiraj iz env.example)
# Windows: copy env.example .env
# Mac/Linux: cp env.example .env

# Otvori .env i ubaci secret-e koje si dobio
```

Primer `.env` fajla:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=abc123def456... (iz generate:secrets)
JWT_REFRESH_SECRET=xyz789uvw012... (iz generate:secrets)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Generiši Prisma Client
npm run prisma:generate

# Kreiraj bazu podataka (SQLite se kreira automatski!)
npm run prisma:migrate

# Pokreni server
npm run start:dev
```

### Korak 2: Frontend

```bash
cd frontend

# Instaliraj pakete
npm install

# Kreiraj .env.local fajl
# Windows: copy env.example .env.local
# Mac/Linux: cp env.example .env.local

# Otvori .env.local i postavi:
NEXT_PUBLIC_API_URL=http://localhost:3001

# Pokreni frontend
npm run dev
```

## ✅ Provera da li sve radi:

1. **Backend**: Otvori http://localhost:3001 - trebalo bi da vidiš "Booking System API is running!"
2. **API Docs**: Otvori http://localhost:3001/api - trebalo bi da vidiš Swagger dokumentaciju
3. **Frontend**: Otvori http://localhost:3000 - trebalo bi da vidiš početnu stranicu

## 🔍 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
cd backend
npm run prisma:generate
```

### "Database file not found"
```bash
cd backend
npm run prisma:migrate
```

### "Port already in use"
Promeni PORT u `.env` fajlu na neki drugi broj (npr. 3002)

## 💡 Važne napomene:

- **SQLite se NE skida** - dolazi automatski!
- **JWT secret može biti bilo koji string** - samo treba da bude dovoljno dug (min 32 karaktera)
- **Baza se kreira automatski** kada pokreneš `prisma:migrate`
- **Nema potrebe za instalacijom baze podataka** - SQLite je fajl-bazirana baza!
