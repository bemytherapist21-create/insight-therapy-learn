// Quick test with curl to bypass caching
const { exec } = require('child_process');

const API_KEY = 'AIzaSyC33sVTEmRS9mqwMZlKBN4STdaWZI11S7Q';

const testData = JSON.stringify({
    input: { text: 'Hello from India' },
    voice: { languageCode: 'en-IN', name: 'en-IN-Neural2-A' },
    audioConfig: { audioEncoding: 'MP3' }
});

const curlCmd = `curl -X POST "https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}" -H "Content-Type: application/json" -d '${testData.replace(/'/g, `'\\''`)}'`;

console.log('Testing TTS API directly...\n');

exec(curlCmd, (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error.message);
        return;
    }

    try {
        const result = JSON.parse(stdout);

        if (result.error) {
            console.log('❌ API Error:', result.error.message);
            console.log('\nPossible issues:');
            console.log('- API might take a few minutes to activate');
            console.log('- Try waiting 2-3 minutes and run test again');
            console.log('- API key might be restricted');
        } else if (result.audioContent) {
            console.log('✅ SUCCESS! TTS API is working!');
            console.log('✅ Indian English voice available!');
            console.log('✅ Ready to integrate!');
        }
    } catch (e) {
        console.log('Response:', stdout);
    }
});
