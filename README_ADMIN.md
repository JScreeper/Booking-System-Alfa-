# Kako da uđeš u Admin Panel

## Opcija 1: Koristi script (preporučeno)

1. **Registruj se** preko aplikacije (ako već nisi):
   - Idi na `/register`
   - Kreiraj nalog sa svojim email-om

2. **Pokreni script** da promeniš role u ADMIN:
   ```bash
   cd backend
   npm run make:admin <tvoj-email>
   ```
   
   Primer:
   ```bash
   npm run make:admin admin@example.com
   ```

3. **Uloguj se** ponovo sa tim email-om i password-om

4. **Idi na admin panel**: `/admin`

## Opcija 2: Direktno u bazi podataka

Ako koristiš SQLite, možeš direktno da promeniš role u bazi:

1. Otvori bazu:
   ```bash
   cd backend
   npx prisma studio
   ```

2. U Prisma Studio:
   - Otvori tabelu `users`
   - Pronađi svoj korisnika
   - Promeni `role` sa `USER` na `ADMIN`
   - Sačuvaj

3. Uloguj se ponovo i idi na `/admin`

## Opcija 3: SQL direktno

Ako želiš da koristiš SQL direktno:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tvoj-email@example.com';
```

---

**Napomena**: Nakon promene role, moraš da se **logout-uješ i uloguješ ponovo** da bi promena stupila na snagu (jer je role sačuvan u JWT tokenu).
