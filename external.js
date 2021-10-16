"use strict";
(function () {
    let stream, recorder;

    function ready() {
        const startRecElem = document.getElementsByClassName("startRec")[0];
        const stopRecElem = document.getElementsByClassName("stopRec")[0];
        const listeningElem = document.getElementsByClassName("listening")[0];
        startRecElem.addEventListener("click", startRecFn);
        stopRecElem.addEventListener("click", stopRecFn);
        stopRecElem.disabled = true;
        listeningElem.style.display = "none";
    }

    async function startRecFn() {
        stream = await navigator.mediaDevices.getUserMedia({audio: true});
        recorder = new RecordRTCPromisesHandler(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: StereoAudioRecorder
        });
        recorder.startRecording();
        document.getElementsByClassName("startRec")[0].disabled = true;
        document.getElementsByClassName("stopRec")[0].disabled = false;
        document.getElementsByClassName("listening")[0].style.display = "block";
    }

    async function stopRecFn() {
        await recorder.stopRecording();
        stream.getAudioTracks().forEach(track => track.stop());
        let blob = await recorder.getBlob();
        const reader = new FileReader();
        reader.onloadend = () => {
            let formData = new FormData();
            formData.append('audio', reader.result.split(',')[1]);
            fetch("http://localhost:3000/sendRec", {method: "POST", body: formData}).then((rData) => {
                return rData.json();
            }).then((rData) => {

                if (rData.transcription) {
                    document.getElementById("textViewer").value += rData.transcription + " ";
                }
                if (rData.error) {
                    alert("An error occured!")
                }
                document.getElementsByClassName("startRec")[0].disabled = false;
            }).catch(() => {
                document.getElementsByClassName("startRec")[0].disabled = false;
            });
        };
        reader.readAsDataURL(blob);
        document.getElementsByClassName("stopRec")[0].disabled = true;
        document.getElementsByClassName("listening")[0].style.display = "none";
    }

    document.addEventListener("DOMContentLoaded", ready);
}());

