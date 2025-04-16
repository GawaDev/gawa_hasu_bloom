import json
from datetime import datetime


def sort_events(events):
    # 開催日と開始時刻でソート
    return sorted(
        events,
        key=lambda x: (datetime.strptime(x["date"], "%Y-%m-%d"), x["start_time"]),
    )


def update_json_file(file_path):
    try:
        # ファイルを読み込み
        with open(file_path, "r", encoding="utf-8") as f:
            events = json.load(f)

        # イベントをソート
        sorted_events = sort_events(events)

        # ソートされたイベントをファイルに書き込み
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(sorted_events, f, ensure_ascii=False, indent=4)

    except FileNotFoundError:
        print(f"{file_path} が見つかりませんでした。")


# streaming_events.json と onsite_events.json をソート
update_json_file("json\streaming_events.json")
update_json_file("json\onsite_events.json")

print("イベントのソートが完了しました。")
