// Test both Gemini API keys to see which has quota

const keys = [
    { name: 'Key 1', key: 'AIzaSyBZCjus2GLDIECuwen7f3U_CfH4yTC7dkU' },
    { name: 'Key 2', key: 'AIzaSyC33sVTEmRS9mqwMZlKBN4STdaWZI11S7Q' }
];

async function testKey(name, apiKey) {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`Key: ${apiKey.substring(0, 20)}...`);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Say "test successful" in one word.' }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates) {
            console.log(`✅ ${name} WORKS!`);
            console.log(`   Response: ${data.candidates[0].content.parts[0].text}`);
            return { name, key: apiKey, status: 'WORKING', error: null };
        } else if (data.error) {
            console.log(`❌ ${name} FAILED`);
            console.log(`   Error: ${data.error.message}`);
            console.log(`   Status: ${data.error.code} - ${data.error.status}`);
            return { name, key: apiKey, status: 'FAILED', error: data.error.message };
        }
    } catch (error) {
        console.log(`❌ ${name} ERROR`);
        console.log(`   ${error.message}`);
        return { name, key: apiKey, status: 'ERROR', error: error.message };
    }
}

async function testAllKeys() {
    console.log('🔍 Testing Gemini API Keys...\n');
    console.log('='.repeat(60));

    const results = [];

    for (const { name, key } of keys) {
        const result = await testKey(name, key);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 SUMMARY:\n');

    const working = results.find(r => r.status === 'WORKING');

    if (working) {
        console.log(`✅ USE THIS KEY: ${working.name}`);
        console.log(`   ${working.key}`);
        console.log('\n👉 This key has available quota and is ready to use!');
    } else {
        console.log('❌ No working keys found.');
        console.log('   Both keys have quota issues or errors.');
        console.log('\n💡 Solutions:');
        console.log('   1. Wait 24 hours for quota reset');
        console.log('   2. Create new API key at https://aistudio.google.com/apikey');
    }
}

testAllKeys();
