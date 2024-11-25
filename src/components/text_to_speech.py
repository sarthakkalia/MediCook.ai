from flask import Flask, render_template, request, send_file
from gtts import gTTS
from io import BytesIO

def text_to_speech(text):
    print("#86")
    # Get the text input from the request
    if not text:
        return "No text provided", 400
    
    # Generate speech using gTTS
    tts = gTTS(text, lang="en")
    audio = BytesIO()
    tts.write_to_fp(audio)
    audio.seek(0)

    # Send the audio file as a response
    return send_file(audio, mimetype="audio/mpeg", download_name="speech.mp3")


