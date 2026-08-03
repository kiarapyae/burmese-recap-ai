'use client';

import { useState } from 'react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [script, setScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');
  
  // Voice State (Default: Nilar)
  const [selectedVoice, setSelectedVoice] = useState('my-MM-NilarNeural');

  const handleGenerateScript = async () => {
    if (!apiKey) return alert('Gemini API Key ထည့်ပေးပါဦး။');
    setLoading(true);
    setAudioUrl('');

    const formData = new FormData();
    formData.append('api_key', apiKey);

    let endpoint = '/api/generate-from-text';

    if (activeTab === 'text') {
      if (!transcript) {
        setLoading(false);
        return alert('Transcript စာသား ထည့်ပါ။');
      }
      formData.append('transcript', transcript);
    } else {
      if (!file) {
        setLoading(false);
        return alert('Video ဖိုင် ရွေးချယ်ပါ။');
      }
      formData.append('file', file);
      endpoint = '/api/generate-from-video';
    }

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to generate script');

      setScript(data.script);
      // Selected Voice ဖြင့် အသံဖိုင် တန်းထုတ်ပေးမည်
      await handleGenerateAudio(data.script, selectedVoice);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async (textScript: string, voiceName: string) => {
    setAudioLoading(true);
    const formData = new FormData();
    formData.append('text', textScript);
    formData.append('voice', voiceName);

    try {
      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        body: formData,
      });
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert('Audio Generation Error');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleVoiceChange = async (newVoice: string) => {
    setSelectedVoice(newVoice);
    if (script) {
      // Script ရှိပြီးသားဖြစ်ပါက အသံအသစ်ကို တန်းပြီး ပြန်ထုတ်ပေးမည်
      await handleGenerateAudio(script, newVoice);
    }
  };

  const handleDownloadScript = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = 'burmese_recap_script.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-10 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Container */}
        <div className="flex-1">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
              🎬 Burmese Movie Recap AI
            </h1>
            <p className="text-slate-400 text-sm mt-2">Select Thiha or Nilar for Voiceover Output</p>
          </header>

          {/* API Key Input */}
          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg">
            <label className="text-xs font-semibold text-slate-400 mb-1 block">🔑 Gemini API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI Studio API Key ထည့်ပါ..."
              className="w-full bg-[#090D16] border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Main Input Box */}
          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex bg-[#090D16] p-1 rounded-xl border border-slate-800 w-fit mb-4">
              <button
                onClick={() => setActiveTab('text')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'text' ? 'bg-red-500 text-white' : 'text-slate-400'
                }`}
              >
                📄 From Text
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'video' ? 'bg-red-500 text-white' : 'text-slate-400'
                }`}
              >
                📤 From Video
              </button>
            </div>

            {activeTab === 'text' ? (
              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Transcript စာသားများ Paste ချပါ..."
                className="w-full bg-[#090D16] border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500"
              />
            ) : (
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#090D16] border border-slate-800 rounded-xl p-3 text-sm"
              />
            )}

            <button
              onClick={handleGenerateScript}
              disabled={loading}
              className="w-full mt-4 bg-red-500 hover:bg-red-600 font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? '⏳ AI စဉ်းစားနေပါသည်...' : '🚀 Generate Recap Script'}
            </button>
          </div>

          {/* Output Area */}
          {script && (
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Script Display Card */}
              <div className="bg-[#111726] border border-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-red-400">📝 Generated Script</h2>
                  <button
                    onClick={handleDownloadScript}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
                  >
                    📥 Download (.txt)
                  </button>
                </div>
                <textarea
                  readOnly
                  value={script}
                  className="w-full h-72 bg-[#090D16] border border-slate-800 rounded-xl p-3 text-sm leading-relaxed text-slate-300 focus:outline-none"
                />
              </div>

              {/* Voice Control & Player Card */}
              <div className="bg-[#111726] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-rose-400 mb-4">🎙️ Voiceover Options</h2>

                  {/* Voice Selection Buttons */}
                  <div className="mb-6">
                    <label className="text-xs text-slate-400 mb-2 block font-medium">အသံ အမျိုးအစား ရွေးပါ:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleVoiceChange('my-MM-NilarNeural')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                          selectedVoice === 'my-MM-NilarNeural'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-[#090D16] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        👩 နီလာ (Nilar)
                      </button>
                      
                      <button
                        onClick={() => handleVoiceChange('my-MM-ThihaNeural')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                          selectedVoice === 'my-MM-ThihaNeural'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-[#090D16] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        👨 သီဟ (Thiha)
                      </button>
                    </div>
                  </div>

                  {/* Audio Player */}
                  {audioLoading ? (
                    <div className="bg-[#090D16] p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                      🎙️ အသံဖိုင် အသစ် ပြောင်းလဲဖန်တီးနေပါသည်...
                    </div>
                  ) : audioUrl ? (
                    <div className="bg-[#090D16] p-4 rounded-xl border border-slate-800 text-center">
                      <audio controls src={audioUrl} className="w-full mb-4" />
                      <a
                        href={audioUrl}
                        download="recap_voiceover.mp3"
                        className="block bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl border border-slate-700"
                      >
                        🎧 Download Voiceover MP3
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}