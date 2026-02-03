import axios from 'axios';

const verify = async () => {
    try {
        console.log('🔄 logging in as admin...');
        const loginRes = await axios.post('http://localhost:8085/api/v1/auth/login', {
            email: 'admin@plugng.shop',
            password: 'Admin123!'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful');
        console.log('👤 Role:', loginRes.data.data.user.role || 'N/A');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('\n🔄 Fetching Dashboard Stats...');
        const statsRes = await axios.get('http://localhost:8085/api/v1/admin/dashboard/stats', { headers });
        console.log('✅ Stats:', statsRes.data.success ? 'Success' : 'Failed');
        console.log('   Revenue:', statsRes.data.data.revenue);
        console.log('   Orders:', statsRes.data.data.orders);

        console.log('\n🔄 Fetching Revenue Chart...');
        const chartRes = await axios.get('http://localhost:8085/api/v1/admin/dashboard/revenue-chart', { headers });
        console.log('✅ Revenue Chart:', chartRes.data.success ? 'Success' : 'Failed');
        console.log('   Points:', chartRes.data.data.length);

        console.log('\n🔄 Fetching Low Stock Alerts...');
        const stockRes = await axios.get('http://localhost:8085/api/v1/admin/dashboard/low-stock', { headers });
        console.log('✅ Low Stock:', stockRes.data.success ? 'Success' : 'Failed');
        console.log('   Alerts:', stockRes.data.data.length);

    } catch (error: any) {
        console.error('❌ Verification failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
};

verify();
