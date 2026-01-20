// Test the NEW Google Cloud API key
const API_KEY = 'AIzaSyCT0TF5qBkMXm_03EKuWvQ22EssPKYwwrA';

async function testNewKey() {
    console.log('🧪 Testing NEW Google Cloud TTS API key...\n');

    try {
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text: 'Hello, testing the natural Indian English voice for therapy sessions.' },
                    voice: {
                        languageCode: 'en-IN',
                        name: 'en-IN-Neural2-A',
                        ssmlGender: 'FEMALE'
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 0.95
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('❌ Error:', data.error.message);
            console.log('\nIssue:', data.error.status);
            return false;
        }

        if (data.audioContent) {
            console.log('✅ SUCCESS! New API key works!');
            console.log('✅ Voice: Indian English Female (Natural)');
            console.log('✅ Audio length:', data.audioContent.length, 'bytes');
            console.log('\n🎉 Ready to deploy to production!');
            return true;
        }

    } catch (error) {
        console.error('❌ Network error:', error.message);
        return false;
    }
}

testNewKey();
