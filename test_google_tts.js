// Test if Google AI Studio API key works for Text-to-Speech
// Run this with: node test_google_tts.js

const API_KEY = 'AIzaSyC33sVTEmRS9mqwMZlKBN4STdaWZI11S7Q';

async function testGoogleTTS() {
    console.log('🧪 Testing Google Cloud Text-to-Speech...\n');

    try {
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text: 'Hello, this is a test of the Indian English voice.' },
                    voice: {
                        languageCode: 'en-IN',
                        name: 'en-IN-Neural2-A', // Indian Female voice
                        ssmlGender: 'FEMALE'
                    },
                    audioConfig: {
                        audioEncoding: 'MP3'
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('❌ API Error:', data.error.message);
            console.log('\n📝 What this means:');

            if (data.error.message.includes('API key not valid')) {
                console.log('   - Your Google AI Studio key does NOT work for TTS');
                console.log('   - You need to create a Google Cloud API key');
                console.log('   - Go to: https://console.cloud.google.com/');
                console.log('   - Enable "Cloud Text-to-Speech API"');
                console.log('   - Create new API key');
            } else if (data.error.message.includes('API has not been used')) {
                console.log('   - TTS API is not enabled on your project');
                console.log('   - Go to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com');
                console.log('   - Click "Enable"');
            } else {
                console.log('   - Unknown error:', data.error.message);
            }

            return false;
        }

        if (data.audioContent) {
            console.log('✅ SUCCESS! Your API key works for Text-to-Speech!');
            console.log('✅ Indian English voice is available!');
            console.log('\n📊 Response details:');
            console.log('   - Audio format: MP3');
            console.log('   - Voice: en-IN-Neural2-A (Indian Female)');
            console.log('   - Audio size:', data.audioContent.length, 'bytes (base64)');
            console.log('\n🎉 Ready to integrate into your website!');
            return true;
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('\n📝 Possible issues:');
        console.log('   - No internet connection');
        console.log('   - API endpoint is blocked');
        return false;
    }
}

// Run the test
testGoogleTTS();
