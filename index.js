const express = require('express')
const formidable = require('formidable');
const speech = require('@google-cloud/speech');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/sendRec', function (req, res) {
    const form = formidable({multiples: true});
    form.parse(req, async (err, fields, files) => {
        try {
            const STTResult = await gcSpeechInit(fields.audio);
            res.end(JSON.stringify(STTResult));
        } catch (error) {
            //res.status(404).end(JSON.stringify(STTResult));
            res.status(error.status || 500).send({
                error: {
                    status: error.status || 500,
                    message: error.message
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function gcSpeechInit(audioBase64) {
    return new Promise(async (resolve, reject) => {
        try {
            const client = new speech.SpeechClient();
            const encoding = 'LINEAR16';
            const languageCode = 'en-US';
            const config = {
                encoding: encoding,
                audioChannelCount: 2,
                enableSeparateRecognitionPerChannel: false,
                languageCode: languageCode,
            };
            const audio = {content: audioBase64};
            const request = {config: config, audio: audio};
            const [response] = await client.recognize(request);
            const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
            resolve({"transcription": transcription});
        } catch (error) {
            reject({"message": error});
        }
    });
}



