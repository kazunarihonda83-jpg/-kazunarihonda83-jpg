import json

# 既存のデータを読み込む
with open('data/qa_data.json', 'r', encoding='utf-8') as f:
    existing_data = json.load(f)

# 新しいデータを読み込む
with open('data/qa_data_extended.json', 'r', encoding='utf-8') as f:
    new_data = json.load(f)

# 新しいカテゴリーを既存のカテゴリーに追加
existing_data['categories'].extend(new_data['new_categories'])

# visual_dataがないQ&Aにはデフォルトを設定
for category in existing_data['categories']:
    for qa in category['qas']:
        if 'visual_data' not in qa:
            qa['visual_data'] = None

# 統合したデータを保存
with open('data/qa_data.json', 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, ensure_ascii=False, indent=2)

print(f"統合完了: {len(existing_data['categories'])}カテゴリー")
total_qas = sum(len(cat['qas']) for cat in existing_data['categories'])
print(f"総Q&A数: {total_qas}")
