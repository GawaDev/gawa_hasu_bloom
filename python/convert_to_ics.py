import json
import uuid
from datetime import datetime, timedelta

import pytz
from icalendar import Calendar, Event


def create_ics_for_google_calendar(
    onsite_events_path: str,
    location_path: str,
    contents_path: str,
    output_ics_path: str = "calendar.ics",
):
    """オンサイトイベント情報を Google カレンダーに取り込める ICS ファイルとして出力する
    ※ データは日本時間（Asia/Tokyo）で書かれています。"""

    # JSON データの読み込み
    with open(onsite_events_path, "r", encoding="utf-8") as f:
        onsite_events = json.load(f)

    with open(location_path, "r", encoding="utf-8") as f:
        location_map = json.load(f)

    with open(contents_path, "r", encoding="utf-8") as f:
        contents_map = json.load(f)

    # 日本のタイムゾーン
    tokyo_tz = pytz.timezone("Asia/Tokyo")

    # ICSカレンダーの初期化（カレンダー全体のメタデータ追加）
    cal = Calendar()
    cal.add("prodid", "-//My Calendar Product//example.com//")
    cal.add("version", "2.0")
    cal.add("calscale", "GREGORIAN")
    cal.add("method", "PUBLISH")
    cal.add("x-wr-calname", "蓮ノ空・声優カレンダー")
    cal.add("x-wr-timezone", "Asia/Tokyo")
    cal.add(
        "x-wr-caldesc",
        "このカレンダーは蓮ノ空・声優イベントの詳細な情報を含むカレンダーです。",
    )

    # イベントごとに処理
    for event_info in onsite_events:
        date_str = event_info["date"]  # "YYYY-MM-DD"
        start_time_str = event_info.get("start_time")
        end_time_str = event_info.get("end_time")

        # 日付のパース
        base_date = datetime.strptime(date_str, "%Y-%m-%d")

        # 開始・終了時刻の決定ロジック
        if not start_time_str and not end_time_str:
            # 両方ない場合は終日イベント
            dtstart = base_date.date()
            dtend = (base_date + timedelta(days=1)).date()  # 終日用に翌日を終了日に
            is_all_day = True
        elif start_time_str and end_time_str:
            # 両方ある場合
            dtstart = datetime.strptime(
                date_str + " " + start_time_str, "%Y-%m-%d %H:%M"
            )
            dtend = datetime.strptime(date_str + " " + end_time_str, "%Y-%m-%d %H:%M")
            is_all_day = False
        elif start_time_str and not end_time_str:
            # 終了時刻がない場合、開始時刻から30分後を終了とする
            dtstart = datetime.strptime(
                date_str + " " + start_time_str, "%Y-%m-%d %H:%M"
            )
            dtend = dtstart + timedelta(minutes=30)
            is_all_day = False
        else:
            # 開始時刻がない場合、終了時刻の30分前を開始とする
            dtend = datetime.strptime(date_str + " " + end_time_str, "%Y-%m-%d %H:%M")
            dtstart = dtend - timedelta(minutes=30)
            is_all_day = False

        # 日本時間のタイムゾーンを設定（終日イベントは日付型のためそのまま）
        if not is_all_day:
            dtstart = tokyo_tz.localize(dtstart)
            dtend = tokyo_tz.localize(dtend)

        # イベント名＋（content_codes の name を括弧書きで追記）
        base_name = event_info["name"]
        content_names = []
        for code in event_info.get("content_codes", []):
            # contents.json から name を取得
            if code in contents_map:
                content_names.append(contents_map[code].get("name", code))
            else:
                content_names.append(code)  # 未登録コードの場合はそのまま

        if content_names:
            suffix = "、".join(content_names)
            event_title = f"{base_name}（{suffix}）"
        else:
            event_title = base_name

        # 場所情報の設定
        location_str = ""
        location_codes = event_info.get("location_code")

        if isinstance(location_codes, list):
            # 配列の場合、存在するコードだけを取り出して名前を取得
            location_names = [
                location_map[code]["name"]
                for code in location_codes
                if code in location_map
            ]
            location_str = ",".join(location_names)
        elif isinstance(location_codes, str) and location_codes in location_map:
            # 単一コード（文字列）の場合
            location_str = location_map[location_codes]["name"]

        # 詳細情報（複数のウェブサイトURLを改行で繋ぐ）
        websites = event_info.get("websites", [])
        description = "\n".join(websites)

        # ICS イベント作成
        ical_event = Event()
        ical_event.add("summary", event_title)

        if is_all_day:
            ical_event.add("dtstart", dtstart)
            ical_event.add("dtend", dtend)
        else:
            ical_event.add("dtstart", dtstart)
            ical_event.add("dtend", dtend)

        ical_event.add("location", location_str)
        ical_event.add("description", description)

        # 追加メタデータの設定
        now_tokyo = datetime.now(tokyo_tz)
        ical_event.add("created", now_tokyo)
        ical_event.add("last-modified", now_tokyo)
        ical_event.add("status", "CONFIRMED")
        ical_event.add("class", "PUBLIC")
        ical_event.add("sequence", 0)
        ical_event.add("transp", "OPAQUE")

        # dtstamp は UTC で設定（Z 表記）
        ical_event.add("dtstamp", datetime.utcnow())

        # ユニークID（UUID）を生成
        ical_event["uid"] = str(uuid.uuid4())

        # イベント情報に応じた追加プロパティ
        if "url" in event_info:
            ical_event.add("url", event_info["url"])

        if "categories" in event_info:
            # カテゴリがリストの場合はカンマ区切りの文字列へ
            if isinstance(event_info["categories"], list):
                ical_event.add("categories", ",".join(event_info["categories"]))
            else:
                ical_event.add("categories", event_info["categories"])

        if "comment" in event_info:
            ical_event.add("comment", event_info["comment"])

        if "geo" in event_info:
            # 例: event_info["geo"] = [latitude, longitude]
            ical_event.add("geo", event_info["geo"])

        if "priority" in event_info:
            ical_event.add("priority", event_info["priority"])

        # 例えば主催者情報があれば追加（例： "organizer": "MAILTO:example@example.com"）
        if "organizer" in event_info:
            ical_event.add("organizer", event_info["organizer"])

        # カレンダーへイベントを追加
        cal.add_component(ical_event)

    # ICS ファイルとして書き出し
    with open(output_ics_path, "wb") as f:
        f.write(cal.to_ical())

    print(f"ICSファイルを出力しました: {output_ics_path}")


if __name__ == "__main__":
    # 実行例
    create_ics_for_google_calendar(
        onsite_events_path="json/onsite_events.json",
        location_path="json/locations.json",
        contents_path="json/contents.json",
        output_ics_path="ics/calendar.ics",
    )
