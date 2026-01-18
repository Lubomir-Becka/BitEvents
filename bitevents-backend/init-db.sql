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

-- Event registrations table (user attendance/participation)
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    ticket_code VARCHAR(100) UNIQUE,
    notes TEXT,
    CONSTRAINT event_registrations_unique UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_registrations_event_idx ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_idx ON event_registrations (user_id);
CREATE INDEX IF NOT EXISTS event_registrations_status_idx ON event_registrations (status);

-- Event images table (multiple images per event)
CREATE TABLE IF NOT EXISTS event_images (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER,
    CONSTRAINT event_images_one_primary_per_event UNIQUE (event_id, is_primary) WHERE is_primary = true
);

CREATE INDEX IF NOT EXISTS event_images_event_idx ON event_images (event_id);
CREATE INDEX IF NOT EXISTS event_images_primary_idx ON event_images (event_id, is_primary) WHERE is_primary = true;

-- Saved events table (user favorites)
CREATE TABLE IF NOT EXISTS saved_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    saved_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT saved_events_unique UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS saved_events_user_idx ON saved_events (user_id);
CREATE INDEX IF NOT EXISTS saved_events_event_idx ON saved_events (event_id);

-- Grant explicit permissions on saved_events table
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_events TO bitevents_app;
GRANT USAGE, SELECT ON SEQUENCE saved_events_id_seq TO bitevents_app;

-- Grant explicit permissions on event_images table
GRANT SELECT, INSERT, UPDATE, DELETE ON event_images TO bitevents_app;
GRANT USAGE, SELECT ON SEQUENCE event_images_id_seq TO bitevents_app;

-- Grant explicit permissions on event_registrations table
GRANT SELECT, INSERT, UPDATE, DELETE ON event_registrations TO bitevents_app;
GRANT USAGE, SELECT ON SEQUENCE event_registrations_id_seq TO bitevents_app;

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


GRANT SELECT, INSERT, UPDATE ON TABLE users, venues, events, event_registrations TO bitevents_app;
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

-- Test venues (IT-focused)
-- Use (SELECT id FROM users WHERE email = '...') to get correct user IDs dynamically
INSERT INTO venues (user_id, name, address, city, latitude, longitude, google_maps_url) VALUES
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), 'Innovation Hub Bratislava', 'Štefánikova 2', 'Bratislava', 48.1486, 17.1077, 'https://maps.google.com/?q=48.1486,17.1077'),
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), 'Tech Campus Bratislava', 'Cesta mládeže 89', 'Bratislava', 48.2137, 17.2153, 'https://maps.google.com/?q=48.2137,17.2153'),
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), 'Digital Business Center', 'Viedenská cesta 10', 'Bratislava', 48.1374, 17.1025, 'https://maps.google.com/?q=48.1374,17.1025'),
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), 'IT Park Poprad', 'Mnoheľova 25', 'Poprad', 49.0611, 20.2968, 'https://maps.google.com/?q=49.0611,20.2968'),
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), 'Tech Conference Center Nitra', 'Výstavná 1', 'Nitra', 48.3089, 18.0931, 'https://maps.google.com/?q=48.3089,18.0931'),
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), 'Innovation Arena Košice', 'Československej armády 1', 'Košice', 48.7164, 21.2611, 'https://maps.google.com/?q=48.7164,21.2611')
ON CONFLICT DO NOTHING;

-- Test events (IT-focused events only)
-- Use subqueries to get correct organizer_id and venue_id dynamically
INSERT INTO events (organizer_id, venue_id, name, description, type, start_date_time, end_date_time, capacity, price, image_url, status) VALUES
-- IT Conferences
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Tech Conference Center Nitra' LIMIT 1), 'DevConf 2026: Cloud & Microservices', 'Medzinárodná konferencia zameraná na cloud computing a mikroslužby. Prednášky od expertov z AWS, Azure a Google Cloud.', 'Konferencia', '2026-03-15 09:00:00+01', '2026-03-16 18:00:00+01', 500, 120.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'IT Park Poprad' LIMIT 1), 'AI & Machine Learning Summit', 'Summit o umelej inteligencii a strojovom učení. Najnovšie trendy v AI, deep learning a neural networks.', 'Konferencia', '2026-04-20 09:00:00+02', '2026-04-21 17:00:00+02', 400, 150.00, 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Digital Business Center' LIMIT 1), 'CyberSecurity Forum Slovakia', 'Konferencia o kybernetickej bezpečnosti. Ochrana dát, etické hackovanie a zabezpečenie infraštruktúry.', 'Konferencia', '2026-05-10 09:00:00+02', '2026-05-11 18:00:00+02', 300, 95.00, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Innovation Hub Bratislava' LIMIT 1), 'JavaScript & Frontend Fest', 'Konferencia pre frontend vývojárov. React, Vue, Angular, Next.js a najnovšie web technológie.', 'Konferencia', '2026-06-05 09:00:00+02', '2026-06-06 18:00:00+02', 350, 85.00, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 'Upcoming'),

-- Hackathons
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Innovation Hub Bratislava' LIMIT 1), 'Hackathon: Smart City Solutions', '24-hodinový hackathon na tému smart cities. Vyvíjajte riešenia pre inteligentné mestá budúcnosti.', 'Hackathon', '2026-02-28 18:00:00+01', '2026-03-01 18:00:00+01', 100, 0.00, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Tech Conference Center Nitra' LIMIT 1), 'AI Hackathon: Healthcare Innovation', 'Hackathon zameraný na AI riešenia v zdravotníctve. Spolupráca s lekármi a AI vývojármi.', 'Hackathon', '2026-04-10 09:00:00+02', '2026-04-12 18:00:00+02', 80, 25.00, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Innovation Arena Košice' LIMIT 1), 'GameDev Hackathon', '48-hodinový hackathon na vývoj hier. Unity, Unreal Engine, indiehry. Ocenenia pre víťazov.', 'Hackathon', '2026-07-15 10:00:00+02', '2026-07-17 18:00:00+02', 120, 15.00, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800', 'Upcoming'),

-- Workshops & Training
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Tech Campus Bratislava' LIMIT 1), 'Docker & Kubernetes Workshop', 'Praktický workshop o kontajnerizácii a orchestrácii. Naučte sa Docker a Kubernetes od základov.', 'Workshop', '2026-02-25 14:00:00+01', '2026-02-25 18:00:00+01', 30, 45.00, 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Digital Business Center' LIMIT 1), 'Python Pre Data Science', 'Workshop o Pythone pre dátovú vedu. NumPy, Pandas, Matplotlib, machine learning s scikit-learn.', 'Workshop', '2026-03-20 10:00:00+01', '2026-03-20 17:00:00+01', 25, 60.00, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'IT Park Poprad' LIMIT 1), 'React Native Mobile Development', 'Intenzívny kurz vývoja mobilných aplikácií v React Native. iOS a Android z jedného codebase.', 'Workshop', '2026-04-05 09:00:00+02', '2026-04-06 17:00:00+02', 20, 120.00, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Tech Campus Bratislava' LIMIT 1), 'Git & GitHub Pro Tips', 'Workshop o pokročilom používaní Git a GitHub. Branching stratégie, CI/CD, code review best practices.', 'Workshop', '2026-05-15 14:00:00+02', '2026-05-15 18:00:00+02', 35, 30.00, 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800', 'Upcoming'),

-- Meetups
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Digital Business Center' LIMIT 1), 'JavaScript Bratislava Meetup', 'Mesačný meetup JavaScript komunity. Prednášky, networking, diskusie o najnovších JS trendoch.', 'Meetup', '2026-02-20 18:00:00+01', '2026-02-20 21:00:00+01', 50, 0.00, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Tech Campus Bratislava' LIMIT 1), 'DevOps Slovakia Meetup', 'Stretnutie DevOps komunity. Zdieľanie skúseností s CI/CD, infraštruktúrou a automatizáciou.', 'Meetup', '2026-03-10 18:00:00+01', '2026-03-10 21:00:00+01', 40, 0.00, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'IT Park Poprad' LIMIT 1), 'Data Science Košice Meetup', 'Komunitné stretnutie data scientistov. Prednášky o ML modeloch, dátovej analýze a vizualizácii.', 'Meetup', '2026-04-15 18:00:00+02', '2026-04-15 21:00:00+02', 45, 0.00, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'Upcoming'),

-- Startup & Business Events
((SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Tech Conference Center Nitra' LIMIT 1), 'Startup Pitch Night', 'Večer pre startupy a investorov. Pitch prezentácie, networking, možnosť získať financovanie.', 'Startup Event', '2026-03-25 17:00:00+01', '2026-03-25 21:00:00+01', 100, 20.00, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', 'Upcoming'),
((SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Innovation Arena Košice' LIMIT 1), 'Tech Careers Fair 2026', 'Veľtrh IT kariér. Stovky pracovných ponúk od technologických firiem. CV konzultácie zdarma.', 'Kariérny Veľtrh', '2026-05-20 10:00:00+02', '2026-05-20 18:00:00+02', 500, 0.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Upcoming')
ON CONFLICT DO NOTHING;

-- Event registrations (test data)
INSERT INTO event_registrations (event_id, user_id, registration_date, status, ticket_code) VALUES
-- DevConf 2026: Cloud & Microservices
((SELECT id FROM events WHERE name = 'DevConf 2026: Cloud & Microservices' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-10 14:30:00+01', 'Confirmed', 'DEVCONF-001'),
((SELECT id FROM events WHERE name = 'DevConf 2026: Cloud & Microservices' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-12 09:15:00+01', 'Confirmed', 'DEVCONF-002'),
((SELECT id FROM events WHERE name = 'DevConf 2026: Cloud & Microservices' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-15 16:20:00+01', 'Confirmed', 'DEVCONF-003'),

-- AI & Machine Learning Summit
((SELECT id FROM events WHERE name = 'AI & Machine Learning Summit' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-14 10:00:00+01', 'Confirmed', 'AIML-001'),
((SELECT id FROM events WHERE name = 'AI & Machine Learning Summit' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-16 11:30:00+01', 'Confirmed', 'AIML-002'),

-- CyberSecurity Forum Slovakia
((SELECT id FROM events WHERE name = 'CyberSecurity Forum Slovakia' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-11 15:45:00+01', 'Confirmed', 'CYBER-001'),
((SELECT id FROM events WHERE name = 'CyberSecurity Forum Slovakia' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-13 08:20:00+01', 'Confirmed', 'CYBER-002'),

-- JavaScript & Frontend Fest
((SELECT id FROM events WHERE name = 'JavaScript & Frontend Fest' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-17 12:00:00+01', 'Confirmed', 'JSFEST-001'),
((SELECT id FROM events WHERE name = 'JavaScript & Frontend Fest' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-17 13:30:00+01', 'Confirmed', 'JSFEST-002'),
((SELECT id FROM events WHERE name = 'JavaScript & Frontend Fest' LIMIT 1), (SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), '2026-01-18 09:00:00+01', 'Confirmed', 'JSFEST-003'),

-- Hackathon: Smart City Solutions
((SELECT id FROM events WHERE name = 'Hackathon: Smart City Solutions' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-08 10:00:00+01', 'Confirmed', 'HACK-CITY-001'),
((SELECT id FROM events WHERE name = 'Hackathon: Smart City Solutions' LIMIT 1), (SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), '2026-01-09 14:00:00+01', 'Confirmed', 'HACK-CITY-002'),
((SELECT id FROM events WHERE name = 'Hackathon: Smart City Solutions' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-10 16:30:00+01', 'Confirmed', 'HACK-CITY-003'),

-- AI Hackathon: Healthcare Innovation
((SELECT id FROM events WHERE name = 'AI Hackathon: Healthcare Innovation' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-12 11:00:00+01', 'Confirmed', 'HACK-HEALTH-001'),
((SELECT id FROM events WHERE name = 'AI Hackathon: Healthcare Innovation' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-15 09:30:00+01', 'Confirmed', 'HACK-HEALTH-002'),

-- Docker & Kubernetes Workshop
((SELECT id FROM events WHERE name = 'Docker & Kubernetes Workshop' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-16 10:15:00+01', 'Confirmed', 'DOCKER-001'),
((SELECT id FROM events WHERE name = 'Docker & Kubernetes Workshop' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-17 14:45:00+01', 'Confirmed', 'DOCKER-002'),
((SELECT id FROM events WHERE name = 'Docker & Kubernetes Workshop' LIMIT 1), (SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), '2026-01-18 08:00:00+01', 'Confirmed', 'DOCKER-003'),

-- Python Pre Data Science
((SELECT id FROM events WHERE name = 'Python Pre Data Science' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-11 13:20:00+01', 'Confirmed', 'PYTHON-001'),
((SELECT id FROM events WHERE name = 'Python Pre Data Science' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-14 15:00:00+01', 'Confirmed', 'PYTHON-002'),

-- React Native Mobile Development
((SELECT id FROM events WHERE name = 'React Native Mobile Development' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-13 10:30:00+01', 'Confirmed', 'REACTNAT-001'),

-- JavaScript Bratislava Meetup
((SELECT id FROM events WHERE name = 'JavaScript Bratislava Meetup' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-18 12:00:00+01', 'Confirmed', 'JSMEETUP-001'),
((SELECT id FROM events WHERE name = 'JavaScript Bratislava Meetup' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-18 13:00:00+01', 'Confirmed', 'JSMEETUP-002'),
((SELECT id FROM events WHERE name = 'JavaScript Bratislava Meetup' LIMIT 1), (SELECT id FROM users WHERE email = 'martin.szabo@example.com' LIMIT 1), '2026-01-18 14:00:00+01', 'Confirmed', 'JSMEETUP-003'),

-- DevOps Slovakia Meetup
((SELECT id FROM events WHERE name = 'DevOps Slovakia Meetup' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-15 11:00:00+01', 'Confirmed', 'DEVOPS-001'),
((SELECT id FROM events WHERE name = 'DevOps Slovakia Meetup' LIMIT 1), (SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), '2026-01-16 10:00:00+01', 'Confirmed', 'DEVOPS-002'),

-- Startup Pitch Night
((SELECT id FROM events WHERE name = 'Startup Pitch Night' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-17 09:00:00+01', 'Confirmed', 'STARTUP-001'),
((SELECT id FROM events WHERE name = 'Startup Pitch Night' LIMIT 1), (SELECT id FROM users WHERE email = 'peter.horvath@example.com' LIMIT 1), '2026-01-18 10:30:00+01', 'Confirmed', 'STARTUP-002'),

-- Tech Careers Fair 2026
((SELECT id FROM events WHERE name = 'Tech Careers Fair 2026' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.kovacova@example.com' LIMIT 1), '2026-01-12 14:00:00+01', 'Confirmed', 'CAREERS-001'),
((SELECT id FROM events WHERE name = 'Tech Careers Fair 2026' LIMIT 1), (SELECT id FROM users WHERE email = 'lucia.tothova@example.com' LIMIT 1), '2026-01-14 11:00:00+01', 'Confirmed', 'CAREERS-002'),
((SELECT id FROM events WHERE name = 'Tech Careers Fair 2026' LIMIT 1), (SELECT id FROM users WHERE email = 'jan.novak@example.com' LIMIT 1), '2026-01-16 15:30:00+01', 'Confirmed', 'CAREERS-003')
ON CONFLICT (event_id, user_id) DO NOTHING;


