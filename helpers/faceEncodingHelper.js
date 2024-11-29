// faceEncodingHelper.js
const { spawn } = require('child_process');

function getFaceEncoding(imagePath) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['face_encoding.py', imagePath]);

        let dataToSend = '';
        pythonProcess.stdout.on('data', (data) => {
            dataToSend += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.log('Python error:', data.toString());
            reject(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(dataToSend);
                    resolve(result);
                } catch (error) {
                    reject('Error parsing facial encoding');
                }
            } else {
                reject(`Python process exited with code ${code}`);
            }
        });
    });
}

module.exports = { getFaceEncoding };
