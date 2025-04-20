# convert_to_sqlite.py

import json
import sqlite3
from pathlib import Path

# SQLiteファイルを削除して新規作成
for file in ["database.db", "database.db-shm", "database.db-wal"]:
    db_path = Path(__file__).resolve().parent.parent / file
    if db_path.exists():
        db_path.unlink()


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def insert_many(cursor, table, data, fields):
    placeholders = ",".join(["?"] * len(fields))
    keys = ",".join(fields)
    cursor.executemany(
        f"INSERT INTO {table} ({keys}) VALUES ({placeholders})",
        [
            [
                json.dumps(row.get(f))
                if isinstance(row.get(f), (list, dict))
                else row.get(f)
                for f in fields
            ]
            for row in data
        ],
    )


basedir = Path(__file__).resolve().parent
json_dir = basedir.parent / "json"
conn = sqlite3.connect(basedir.parent / "database.db")
c = conn.cursor()

with open(basedir.parent / "schema.sql", encoding="utf-8") as f:
    c.executescript(f.read())

# contents
contents = load_json(json_dir / "contents.json")
content_rows = []
content_person_links = []
for code, content in contents.items():
    content_rows.append(
        {
            "code": code,
            "name": content.get("name"),
            "color": content.get("color"),
            "websites": json.dumps(content.get("websites", [])),
        }
    )
    for person in content.get("persons", []):
        content_person_links.append({"content_code": code, "person_name": person})
insert_many(c, "contents", content_rows, ["code", "name", "color", "websites"])
insert_many(c, "content_person", content_person_links, ["content_code", "person_name"])

# locations
locations = load_json(json_dir / "locations.json")
loc_rows = []
for code, loc in locations.items():
    loc_rows.append(
        {
            "code": code,
            "name": loc.get("name"),
            "prefecture": loc.get("prefecture"),
            "city": loc.get("city"),
            "nearest_station": loc.get("nearest_station"),
            "capacity": loc.get("capacity"),
            "show_map": int(loc.get("show_map", True)),
            "websites": json.dumps(loc.get("websites", [])),
        }
    )
insert_many(
    c,
    "locations",
    loc_rows,
    [
        "code",
        "name",
        "prefecture",
        "city",
        "nearest_station",
        "capacity",
        "show_map",
        "websites",
    ],
)

# persons
persons = load_json(json_dir / "persons.json")
insert_many(
    c,
    "persons",
    persons,
    [
        "name",
        "name_reading",
        "name_en",
        "nicknames",
        "hometown",
        "affiliation",
        "birth_yyyymmdd",
        "color",
        "description",
    ],
)

# holidays
holidays = load_json(json_dir / "holidays.json")
insert_many(c, "holidays", holidays, ["date", "name", "remarks"])

# onsite_events
onsite = load_json(json_dir / "onsite_events.json")
event_rows = []
event_content_links = []
event_location_links = []

for i, event in enumerate(onsite):
    event_id = i + 1
    event_rows.append(
        {
            "id": event_id,
            "date": event.get("date"),
            "start_time": event.get("start_time"),
            "end_time": event.get("end_time"),
            "name": event.get("name"),
            "websites": json.dumps(event.get("websites", [])),
        }
    )
    for code in event.get("content_codes", []):
        event_content_links.append({"event_id": event_id, "content_code": code})
    for code in event.get("location_codes", []):
        event_location_links.append({"event_id": event_id, "location_code": code})

insert_many(
    c,
    "onsite_events",
    event_rows,
    ["id", "date", "start_time", "end_time", "name", "websites"],
)
insert_many(
    c, "onsite_event_content", event_content_links, ["event_id", "content_code"]
)
insert_many(
    c, "onsite_event_location", event_location_links, ["event_id", "location_code"]
)

conn.commit()
conn.close()
print("✅ database.db 作成完了")
