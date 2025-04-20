    # 蓮ノ空データベース設計ドキュメント

    本ドキュメントは、「蓮ノ空女学院スクールアイドルクラブ」および関連キャスト・イベント等の情報を一元的に管理するデータベース設計の構造を説明するものです。

    ## 構成の基本方針

    - 各エンティティは明確な主キーを持ち、拡張性・正規化を考慮。
    - リスト構造（例：URL一覧、ニックネーム、履歴等）はサブテーブルで展開。
    - `[開始、終了、対象ID]`のような複合履歴データは、専用の中間テーブルを設置。
    - 順序が重要な要素には `order_no` を設けて順序保持。

    ## テーブル分類

    ### 一般情報
    - `holidays`：祝日情報。年月日・名称・備考を記録。
    - `locations`：会場や配信拠点。住所や座標、収容人数、最寄駅などを記録。
    - `location_urls`：`locations` に紐づく複数URLを管理。
    - `location_groups`：バリエーションを含む同一系ロケーションのグルーピング。
    - `web_services` / `web_service_urls`：配信や掲載に使われるサービスの基本情報とURL。

    ### キャスト情報
    - `casts`：声優や出演者の基本情報。
    - `cast_nicknames`：愛称や略称など。
    - `cast_organizations` / `cast_organization_urls`：キャストの所属事務所等。
    - `cast_histories`：キャストの経歴（開始・終了・所属・記事・注釈）。
    - `cast_urls`：外部プロフィールやSNS等のリンク。

    ### クリエイター
    - `creators` / `creator_urls`：楽曲制作などに関与するクリエイター。

    ### キャスト舞台地・紹介アイテム
    - `cast_spot_items`：イベントや記事に紐づく舞台地（個人別）。

    ### 蓮ノ空_キャラクター情報
    - `hasunosora_characters`：キャラクターの基本情報（プロフィール含む）。
    - `hasunosora_character_profiles`：公式の期別プロフィール（複数可）。
    - `hasunosora_character_casts`：キャストと紐づけ（複数交代可）。
    - `hasunosora_character_histories`：所属先の変遷（公式設定含む）。
    - `hasunosora_character_orgs`：キャラクターの組織（学校等）。

    ### 蓮ノ空_ディスコグラフィ
    - `hasunosora_discographies`：作品ごとのまとめ単位。
    - `hasunosora_disks`：CDやBD等の個別メディア。
    - `hasunosora_songs`：収録楽曲。ストリーミングリンクも保持。
    - `hasunosora_song_creators`：クリエイターと担当パート。
    - `hasunosora_song_groups` / `hasunosora_song_group_members`：同一楽曲としてまとめられるパターン。
    - `hasunosora_artists` / `hasunosora_artist_members`：アーティスト情報（キャラクター×キャスト単位）。
    - `hasunosora_artist_groups` / `hasunosora_artist_group_members`：ユニット等のグルーピング。

    ### 蓮ノ空_イベント
    - `hasunosora_events_day`：単日イベントの基本情報。
    - 関連する `event_*` テーブル群で、ロケーション、Webサービス、出演者、セットリスト、ディスコグラフィ等を紐づけ。
    - `hasunosora_events_group` / `hasunosora_event_group_members`：複数日程をグループ化。
    - `hasunosora_events_tour` / `hasunosora_event_tour_members`：ツアーとしてさらに上位のグルーピング。
    - `hasunosora_event_setlists` / `setlist_members`：セットリストの順序・出演メンバー・衣装。

    ### 活動記録・カード・コネクト
    - `hasunosora_activities` / `activity_parts`：月別活動まとめ、パート構成。
    - `hasunosora_school_idol_connect`：スクールアイドルコネクトの配信内容。
    - `hasunosora_cards` / `card_cross_voices`：リンクラカードの特訓ボイス・クロスボイス。

    ### 蓮ノ空_舞台地・紹介アイテム
    - `hasunosora_spots`：舞台地・紹介地。活動記録・カード・コネクトなどに紐づく。

    ## 今後の拡張余地
    - キャスト個人イベント/楽曲テーブル
    - キャラクター個別の誕生日記念イベント等の紐づけ
    - ID体系の統一（命名規則の設計）

    本DB設計は、ファン活動支援ツール「BloomApps」群の基盤として、柔軟かつ拡張可能な構造を目指しています。