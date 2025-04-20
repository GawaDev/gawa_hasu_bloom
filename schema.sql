-- schema.sql

-- メインテーブル
CREATE TABLE onsite_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  name TEXT NOT NULL,
  websites TEXT
);

CREATE TABLE contents (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  websites TEXT
);

CREATE TABLE locations (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefecture TEXT,
  city TEXT,
  nearest_station TEXT,
  capacity INTEGER,
  show_map INTEGER,
  websites TEXT
);

CREATE TABLE persons (
  name TEXT PRIMARY KEY,
  name_reading TEXT,
  name_en TEXT,
  nicknames TEXT,
  hometown TEXT,
  affiliation TEXT,
  birth_yyyymmdd TEXT,
  color TEXT,
  description TEXT
);

CREATE TABLE holidays (
  date TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  remarks TEXT
);

-- 中間テーブル
CREATE TABLE onsite_event_content (
  event_id INTEGER,
  content_code TEXT,
  PRIMARY KEY (event_id, content_code),
  FOREIGN KEY (event_id) REFERENCES onsite_events(id),
  FOREIGN KEY (content_code) REFERENCES contents(code)
);

CREATE TABLE onsite_event_location (
  event_id INTEGER,
  location_code TEXT,
  PRIMARY KEY (event_id, location_code),
  FOREIGN KEY (event_id) REFERENCES onsite_events(id),
  FOREIGN KEY (location_code) REFERENCES locations(code)
);

CREATE TABLE content_person (
  content_code TEXT,
  person_name TEXT,
  PRIMARY KEY (content_code, person_name),
  FOREIGN KEY (content_code) REFERENCES contents(code),
  FOREIGN KEY (person_name) REFERENCES persons(name)
);
