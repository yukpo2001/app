import json
import os

input_path = r'D:\구글 지도 백업\구글지도\Takeout\지도(내 장소)\리뷰.json'
output_path = r'd:\안티그래비티\스티치수익화\src\data\user_tastes_extracted.json'

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

extracted_reviews = []
all_tags = []

for feature in data.get('features', []):
    props = feature.get('properties', {})
    location = props.get('location', {})
    name = location.get('name', 'Unknown')
    rating = props.get('five_star_rating_published', 0)
    text = props.get('review_text_published', '')
    
    # Store all high-rated places or those with text
    if rating >= 4 or text:
        extracted_reviews.append({
            'place': name,
            'rating': rating,
            'text': text
        })

# Sort by date (if possible) or just take a good sample.
# For now, let's just take all for taste analysis
sample_reviews = extracted_reviews

final_data = {
    'user': 'yukpo2001',
    'style_keywords': ['modern', 'minimal', 'local', 'traditional', 'cozy'], # Initial set
    'reviews': sample_reviews
}

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f'Successfully extracted {len(sample_reviews)} reviews to {output_path}')
