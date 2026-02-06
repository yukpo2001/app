/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const inputPath = 'D:\\구글 지도 백업\\구글지도\\Takeout\\지도(내 장소)\\리뷰.json';
const outputPath = path.join(__dirname, '..', 'src', 'data', 'user_tastes.json');

try {
    console.log(`Reading data from ${inputPath}...`);
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log('Processing features...');
    const extractedReviews = data.features
        .map(feature => {
            const props = feature.properties || {};
            const location = props.location || {};
            return {
                place: location.name || 'Unknown',
                rating: props.five_star_rating_published || 0,
                text: props.review_text_published || '',
                date: props.date || ''
            };
        })
        .filter(review => review.rating >= 4 || (review.text && review.text.trim().length > 0))
        .slice(0, 100); // Take top 100 relevant reviews

    const finalData = {
        user: 'yukpo2001',
        style_keywords: ['modern', 'minimal', 'local', 'traditional', 'cozy', '친절', '깔끔', '맛있음'],
        reviews: extractedReviews
    };

    console.log(`Writing processed data to ${outputPath}...`);
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`Successfully extracted ${extractedReviews.length} reviews.`);

} catch (error) {
    console.error('Error processing reviews:', error.message);
    process.exit(1);
}
