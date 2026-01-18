-- Create application role (user) if not exists
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bitevents_app') THEN
      CREATE ROLE bitevents_app WITH
          LOGIN
          PASSWORD '7RfrMmnc1eoRsVRd2t'
          NOSUPERUSER
          NOCREATEDB
          NOCREATEROLE
          NOBYPASSRLS
          CONNECTION LIMIT 50;
   END IF;
END
$$;


GRANT CONNECT ON DATABASE bitevents_db TO bitevents_app;

GRANT USAGE ON SCHEMA public TO bitevents_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO bitevents_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bitevents_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO bitevents_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE ON SEQUENCES TO bitevents_app;

REVOKE CREATE ON SCHEMA public FROM bitevents_app;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    profile_picture TEXT,
    is_organizer BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT users_email_check CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

-- Use a case-insensitive unique index for emails (avoid duplicates with different case)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));


CREATE TABLE IF NOT EXISTS venues (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    google_maps_url TEXT
);

CREATE INDEX IF NOT EXISTS venues_city_idx ON venues (city);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    creation_date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date_time TIMESTAMP WITH TIME ZONE,
    capacity INTEGER,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
    CONSTRAINT events_capacity_nonnegative CHECK (capacity IS NULL OR capacity >= 0),
    CONSTRAINT events_price_nonnegative CHECK (price >= 0),
    CONSTRAINT events_end_after_start CHECK (end_date_time IS NULL OR end_date_time >= start_date_time)
);

CREATE INDEX IF NOT EXISTS events_start_idx ON events (start_date_time);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);

-- Trigger function to validate event dates
CREATE OR REPLACE FUNCTION validate_event_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.end_date_time IS NOT NULL AND NEW.start_date_time IS NOT NULL AND NEW.end_date_time < NEW.start_date_time) THEN
        RAISE EXCEPTION 'end_date_time (%) cannot be before start_date_time (%)', NEW.end_date_time, NEW.start_date_time;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_event_dates ON events;
CREATE TRIGGER trg_validate_event_dates
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION validate_event_dates();

-- Trigger to normalize (lowercase) user email before insert/update
CREATE OR REPLACE FUNCTION normalize_user_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS NOT NULL THEN
        NEW.email := lower(NEW.email);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_user_email ON users;
CREATE TRIGGER trg_normalize_user_email
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION normalize_user_email();


GRANT SELECT, INSERT, UPDATE ON TABLE users, venues, events TO bitevents_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bitevents_app;


-- Insert test data

-- Test users (passwords are hashed for "password123")
INSERT INTO users (full_name, email, password_hash, is_organizer, profile_picture) VALUES
('Ján Novák', 'jan.novak@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true, 'https://i.pravatar.cc/150?img=12'),
('Peter Horváth', 'peter.horvath@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true, 'https://i.pravatar.cc/150?img=13'),
('Mária Kováčová', 'maria.kovacova@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', false, 'https://i.pravatar.cc/150?img=5'),
('Lucia Tóthová', 'lucia.tothova@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', false, 'https://i.pravatar.cc/150?img=9'),
('Martin Szabó', 'martin.szabo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true, 'https://i.pravatar.cc/150?img=33')
ON CONFLICT DO NOTHING;

-- Test venues
INSERT INTO venues (user_id, name, address, city, latitude, longitude, google_maps_url) VALUES
(1, 'Mestská športová hala', 'Štefánikova 2', 'Bratislava', 48.1486, 17.1077, 'https://maps.google.com/?q=48.1486,17.1077'),
(1, 'Kultúrny dom Vajnory', 'Cesta mládeže 89', 'Bratislava', 48.2137, 17.2153, 'https://maps.google.com/?q=48.2137,17.2153'),
(2, 'Divadlo Aréna', 'Viedenská cesta 10', 'Bratislava', 48.1374, 17.1025, 'https://maps.google.com/?q=48.1374,17.1025'),
(2, 'NTC Poprad', 'Mnoheľova 25', 'Poprad', 49.0611, 20.2968, 'https://maps.google.com/?q=49.0611,20.2968'),
(5, 'Výstavisko Agrokomplex', 'Výstavná 1', 'Nitra', 48.3089, 18.0931, 'https://maps.google.com/?q=48.3089,18.0931'),
(5, 'Steel Aréna', 'Československej armády 1', 'Košice', 48.7164, 21.2611, 'https://maps.google.com/?q=48.7164,21.2611')
ON CONFLICT DO NOTHING;

-- Test events (various types and dates)
INSERT INTO events (organizer_id, venue_id, name, description, type, start_date_time, end_date_time, capacity, price, image_url, status) VALUES
-- Upcoming concerts
(1, 1, 'Rockový festival 2026', 'Najväčší rocková udalosť roka s účinkovaním slovenských a zahraničných kapiel. Pripravte sa na nezabudnuteľný zážitok plný skvelej muziky a úžasnej atmosféry.', 'Koncert', '2026-06-15 18:00:00+02', '2026-06-15 23:00:00+02', 500, 25.00, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'Upcoming'),
(2, 3, 'Jazzová noc', 'Večer plný jazzovej muziky s medzinárodnými umelcami. Príďte si vychutnať najlepšie jazzové skladby v intímnom prostredí divadla.', 'Koncert', '2026-03-20 20:00:00+01', '2026-03-20 23:30:00+01', 150, 18.50, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'Upcoming'),
(5, 6, 'Klasická hudba: Vivaldi a Bach', 'Koncert klasickej hudby s dielami veľkých majstrov. Symfonický orchester zahrá najznámejšie skladby Vivaldiho a Bacha.', 'Koncert', '2026-04-10 19:00:00+02', '2026-04-10 21:30:00+02', 300, 22.00, 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800', 'Upcoming'),

-- Sports events
(1, 1, 'Futbalový turnaj amatérskych tímov', 'Prestížny turnaj pre amatérske futbalové tímy z celého Slovenska. Zápasy celý deň, finále večer.', 'Šport', '2026-05-01 09:00:00+02', '2026-05-01 18:00:00+02', 1000, 5.00, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800', 'Upcoming'),
(2, 6, 'Hokejový zápas: HC Košice vs. HC Nitra', 'Extraligový zápas medzi tradičnými rivalmi. Očakáva sa vypredaná aréna a skvelá atmosféra.', 'Šport', '2026-02-28 17:30:00+01', '2026-02-28 20:00:00+01', 8000, 15.00, 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800', 'Upcoming'),
(5, 1, 'Volejbalový turnaj', 'Medzinárodný volejbalový turnaj s účasťou najlepších slovenských a českých tímov.', 'Šport', '2026-03-15 10:00:00+01', '2026-03-15 19:00:00+01', 500, 8.00, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 'Upcoming'),

-- Exhibitions
(2, 5, 'Výstava moderného umenia', 'Rozsiahla výstava súčasného umenia slovenských aj zahraničných umelcov. Viac ako 100 exponátov.', 'Výstava', '2026-03-01 10:00:00+01', '2026-03-31 18:00:00+02', 200, 0.00, 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', 'Upcoming'),
(5, 5, 'Agrokomplex 2026', 'Najväčšia poľnohospodárska výstava na Slovensku. Prezentácia najnovších technológií a produktov.', 'Výstava', '2026-08-20 09:00:00+02', '2026-08-23 18:00:00+02', 5000, 12.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Upcoming'),

-- Workshops
(1, 2, 'Workshop fotografovania pre začiatočníkov', 'Naučte sa základy fotografovania od profesionálneho fotografa. Budeme sa venovať kompozícii, svetlu a nastaveniu fotoaparátu.', 'Workshop', '2026-02-25 14:00:00+01', '2026-02-25 18:00:00+01', 20, 35.00, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800', 'Upcoming'),
(2, 3, 'Divadelný workshop: Herecké techniky', 'Intenzívny workshop zameraný na základné herecké techniky a improvizáciu. Vhodné pre začiatočníkov.', 'Workshop', '2026-03-05 10:00:00+01', '2026-03-05 16:00:00+01', 15, 40.00, 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', 'Upcoming'),
(5, 4, 'Kurz varenia talianskej kuchyne', 'Pripravte si autentické talianske jedlá pod vedením skúseného šéfkuchára. Ochutnávka na konci kurzu.', 'Workshop', '2026-04-12 15:00:00+02', '2026-04-12 19:00:00+02', 12, 45.00, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', 'Upcoming'),

-- Past events
(1, 1, 'Novoročný koncert 2026', 'Tradičný novoročný koncert s klasickou hudbou a ľudovými piesňami.', 'Koncert', '2026-01-05 19:00:00+01', '2026-01-05 21:30:00+01', 300, 20.00, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'Completed'),
(2, 3, 'Silvestrovská párty 2025', 'Veľká silvestrovská oslava s DJ, tancom a polnočným ohňostrojom.', 'Párty', '2025-12-31 21:00:00+01', '2026-01-01 03:00:00+01', 250, 50.00, 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800', 'Completed'),

-- Theater performances
(2, 3, 'Divadelné predstavenie: Romeo a Júlia', 'Klasická hra Williama Shakespeara v modernej réžii. Nezabudnuteľný zážitok pre milovníkov divadla.', 'Divadlo', '2026-03-28 19:30:00+01', '2026-03-28 22:00:00+01', 150, 15.00, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800', 'Upcoming'),
(2, 3, 'Komédia: Smiech je liek', 'Zábavná komédia plná humoru a nečakaných zvratov. Ideálne na relaxáciu po náročnom týždni.', 'Divadlo', '2026-05-10 20:00:00+02', '2026-05-10 22:00:00+02', 150, 12.00, 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800', 'Upcoming'),

-- Conferences
(5, 5, 'IT konferencia: Budúcnosť technológií', 'Medzinárodná konferencia o najnovších trendoch v IT. Prednášajú odborníci z Google, Microsoft a ďalších firiem.', 'Konferencia', '2026-06-05 09:00:00+02', '2026-06-06 18:00:00+02', 500, 150.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Upcoming'),
(5, 4, 'Startup Summit 2026', 'Stretnutie startupov, investorov a podnikateľov. Networking, prednášky a pitch súťaž.', 'Konferencia', '2026-07-15 10:00:00+02', '2026-07-15 19:00:00+02', 300, 80.00, 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', 'Upcoming')
ON CONFLICT DO NOTHING;

