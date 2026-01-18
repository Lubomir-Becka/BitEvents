# BitEvents Backend

Spring Boot aplikácia pre správu udalostí.

## Požiadavky

- Docker a Docker Compose
- Java 21 (pre lokálny vývoj bez Dockeru)
- Maven (pre lokálny vývoj bez Dockeru)

## Rýchly štart s Docker Compose

1. Uistite sa, že máte `.env` súbor (už existuje v projekte)

2. **Dôležité:** Ak ste už spúšťali aplikáciu predtým, najprv vymažte staré dáta:
   ```bash
   docker compose down -v
   ```

3. Spustite aplikáciu a databázu:
   ```bash
   docker compose up --build
   ```
   
   Alebo použite pripravený skript:
   ```bash
   ./restart.sh
   ```

4. Počkajte kým sa backend úspešne pripojí (uvidíte "Started BiteventsApplication")
5. Aplikácia beží na `http://localhost:8080`
6. PostgreSQL beží na `localhost:5432`

## Konfigurácia

Všetky konfiguračné premenné sú v `.env` súbore:

- `DB_NAME` - názov databázy (default: `bitevents_db`)
- `DB_ADMIN_USER` - admin používateľ PostgreSQL (default: `postgres`)
- `DB_ROOT_PASSWORD` - heslo pre admin používateľa
- `APP_DB_USER` - používateľ aplikácie (default: `bitevents_app`)
- `APP_DB_PASSWORD` - heslo pre používateľa aplikácie
- `JWT_SECRET` - tajný kľúč pre JWT tokeny (ZMENTE V PRODUKCII!)
- `APP_CORS_ALLOWED_ORIGINS` - povolené CORS originy (default: `*`)

## Databáza

Pri prvom spustení sa automaticky vytvorí databázová schéma z `init-db.sql`:

- Tabuľka `users` - používatelia
- Tabuľka `venues` - miesta konania
- Tabuľka `events` - udalosti
- Constrainty, indexy a triggers pre validáciu dát

### Schéma obsahuje:

- CHECK constraints (email formát, nezáporné ceny/kapacity, dátumy)
- Indexy (email, mesto, dátum začiatku, status)
- Triggery (validácia dátumov udalostí, normalizácia emailov)

## Riešenie problémov

### "Connection attempt failed" / "Unable to obtain JDBC connection"

**Riešenie:**
1. Zastavte všetky kontajnery: `docker compose down -v`
2. Vymažte priečinok `pg_data/` (ak existuje): `rm -rf pg_data/`
3. Spustite znova: `docker compose up --build`

**Príčina:** Backend sa pokúsil pripojiť pred tým, než bola databáza pripravená. Teraz má Dockerfile vstavaný wait-for-db mechanizmus.

### Backend sa nespustí / chyby pri vytváraní tabuliek

**Riešenie:**
1. Skontrolujte či heslo v `.env` (APP_DB_PASSWORD) sa zhoduje s heslom v `init-db.sql`
2. Vymažte databázu: `docker compose down -v`
3. Spustite znova

### Kontrola logov

```bash
# Všetky logy
docker compose logs

# Len backend
docker compose logs backend

# Len databáza
docker compose logs db

# Sledovanie v reálnom čase
docker compose logs -f
```

## Lokálny vývoj (bez Dockeru)

1. Spustite PostgreSQL lokálne alebo cez Docker:
   ```bash
   docker compose up db
   ```

2. Spustite aplikáciu:
   ```bash
   mvn spring-boot:run
   ```

## API Endpointy

- `POST /api/auth/register` - registrácia
- `POST /api/auth/login` - prihlásenie
- `GET /api/events` - zoznam udalostí
- `POST /api/events` - vytvorenie udalosti (vyžaduje autentifikáciu)
- `GET /api/venues` - zoznam miest
- `POST /api/venues` - vytvorenie miesta (vyžaduje autentifikáciu)

## Zastavenie

```bash
docker compose down
```

Pre vymazanie dát (vrátane databázy):
```bash
docker compose down -v
```

## Poznámky

- `.env` súbor je v `.gitignore` a nemá sa commitovať
- Pre produkciu použite silné heslá a JWT secret
- Databázové migrácie sa vykonávajú cez `init-db.sql` pri prvom štarte
- Backend automaticky počká na databázu (wait-for-db script v Dockerfile)
- Healthcheck kontroluje či je databáza pripravená pred spustením backendu
