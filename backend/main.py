from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from google import genai
import edge_tts
import tempfile
import asyncio
import os

app = FastAPI(title="Burmese Movie Recap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "gemini-3.5-flash"

PROMPT = """
Act as a professional Burmese Movie Recap YouTuber. 
Rewrite the content into an engaging, exciting movie recap script in Burmese.
Start with 'ပရိတ်သတ်ကြီးတို့ရေ...' and output ONLY the script.
"""

@app.post("/api/generate-from-text")
async def generate_from_text(transcript: str = Form(...), api_key: str = Form(...)):
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[PROMPT, transcript]
        )
        return {"script": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-from-video")
async def generate_from_video(file: UploadFile = File(...), api_key: str = Form(...)):
    try:
        client = genai.Client(api_key=api_key)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            contents = await file.read()
            tmp.write(contents)
            video_path = tmp.name

        video_file = client.files.upload(file=video_path)

        while video_file.state.name == "PROCESSING":
            await asyncio.sleep(2)
            video_file = client.files.get(name=video_file.name)

        if video_file.state.name == "FAILED":
            os.remove(video_path)
            raise HTTPException(status_code=500, detail="Video processing failed on Gemini servers.")

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[PROMPT, video_file]
        )
        
        os.remove(video_path)
        return {"script": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Voice selection အလုပ်လုပ်နိုင်ရန် voice parameter ထည့်သွင်းထားပါသည်
@app.post("/api/generate-tts")
async def generate_tts(text: str = Form(...), voice: str = Form("my-MM-NilarNeural")):
    try:
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        # ရွေးချယ်လိုက်သော voice (Thiha သို့မဟုတ် Nilar) ဖြင့် အသံထွက်ပေးပါမည်
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(temp_audio.name)
        return FileResponse(temp_audio.name, media_type="audio/mpeg", filename="recap.mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))