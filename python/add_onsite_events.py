import json
from datetime import datetime, timedelta


def add_onsite_events(new_event, repeat_until=None, repeat_interval_weeks=1):
    # JSONファイルを読み込む
    with open("json\\onsite_events.json", "r", encoding="utf-8") as file:
        events = json.load(file)

    # イベントの繰り返し処理
    if repeat_until:
        end_date = datetime.strptime(repeat_until, "%Y-%m-%d")
        event_date = datetime.strptime(new_event["date"], "%Y-%m-%d")
        while event_date <= end_date:
            # イベントをコピーして日付を更新
            event_copy = new_event.copy()
            event_copy["date"] = event_date.strftime("%Y-%m-%d")
            events.append(event_copy)
            event_date += timedelta(weeks=repeat_interval_weeks)
    else:
        events.append(new_event)

    # イベントを日付と開始時刻でソート
    events.sort(
        key=lambda x: (datetime.strptime(x["date"], "%Y-%m-%d"), x["start_time"])
    )

    # JSONファイルに書き戻す
    with open("json\\onsite_events.json", "w", encoding="utf-8") as file:
        json.dump(events, file, ensure_ascii=False, indent=4)

    print(new_event)


if __name__ == "__main__":
    # 新しいイベントの情報
    new_event = {
        "date": "2025-06-15",
        "start_time": "",
        "end_time": "23:59",
        "content_codes": ["hasunosora"],
        "name": "6月中～下旬 リンクラ公式ショップ 102期生卒業記念グッズセット 〜いつでも、いつまでも〜 発送",
        "location_code": [""],
        "websites": ["https://www.linklikeshop.com/"],
    }

    # 単発イベント
    add_onsite_events(new_event)

    # 例：隔週で繰り返し（2週ごと、6月〜7月末まで）
    # add_onsite_events(new_event, repeat_until="2025-12-31", repeat_interval_weeks=1)
"""
データを上旬中旬下旬に対応するよう変更 年月日分離
データベース整備 jsonデータベース移行 形式変更 新入生卒業生 履歴になるように
"""
