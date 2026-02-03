const axios = require('axios');

async function testOnSale() {
    try {
        const res = await axios.get('http://localhost:8085/api/v1/products?onSale=true');
        console.log('Results count:', res.data.results);
        console.log('Products:', JSON.stringify(res.data.data.products, null, 2));
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testOnSale();
