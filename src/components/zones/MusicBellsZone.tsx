import React, { useState, useEffect, useRef } from 'react';
import { NURSERY_SONGS, MUSIC_NOTES } from '../../data/worldZones';
import { NurserySong, MusicInstrumentType } from '../../types';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  Play,
  Square,
  ArrowLeft,
  Music,
  Disc,
  RefreshCw,
  Award,
  Wand2,
  Loader2,
  Mic,
  VolumeX
} from 'lucide-react';

interface MusicBellsZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

export const MusicBellsZone: React.FC<MusicBellsZoneProps> = ({
  onEarnStar,
  onBack
}) => {
  const [allSongs, setAllSongs] = useState<NurserySong[]>(NURSERY_SONGS);
  const [instrument, setInstrument] = useState<MusicInstrumentType>('xylophone');
  const [activeSong, setActiveSong] = useState<NurserySong>(NURSERY_SONGS[0]);
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(false);
  const [currentSongNoteIndex, setCurrentSongNoteIndex] = useState<number>(-1);
  const [notesPlayedCount, setNotesPlayedCount] = useState<number>(0);

  // AI Music Generator State
  const [isGeneratingSong, setIsGeneratingSong] = useState<boolean>(false);
  const [musicTheme, setMusicTheme] = useState<string>('Butterflies & Wildflowers');
  const [musicMood, setMusicMood] = useState<string>('cheerful');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedNotes, setRecordedNotes] = useState<{ noteIndex: number; time: number }[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, []);

  const handlePlayNote = (index: number) => {
    audioService.playInstrumentSound(index, instrument);

    if (isRecording) {
      const elapsed = Date.now() - recordStartTimeRef.current;
      setRecordedNotes(prev => [...prev, { noteIndex: index, time: elapsed }]);
    }

    const nextCount = notesPlayedCount + 1;
    setNotesPlayedCount(nextCount);
    if (nextCount === 16) {
      audioService.playSparkle();
      confetti({ particleCount: 50, spread: 70 });
      onEarnStar();
    }
  };

  const handlePlayFollowSong = () => {
    if (isPlayingSong) {
      setIsPlayingSong(false);
      setCurrentSongNoteIndex(-1);
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
      return;
    }

    setIsPlayingSong(true);
    let noteIdx = 0;
    const playNext = () => {
      if (noteIdx >= activeSong.melodyNotes.length) {
        setIsPlayingSong(false);
        setCurrentSongNoteIndex(-1);
        audioService.playSuccess();
        confetti({ particleCount: 45, spread: 65 });
        onEarnStar();
        return;
      }

      const noteToPlay = activeSong.melodyNotes[noteIdx];
      setCurrentSongNoteIndex(noteToPlay);
      audioService.playInstrumentSound(noteToPlay, instrument);
      noteIdx += 1;
      playbackTimeoutRef.current = setTimeout(playNext, 440);
    };

    playNext();
  };

  const handleReadLyrics = () => {
    audioService.playPop();
    audioService.speak(activeSong.lyrics);
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordedNotes([]);
      recordStartTimeRef.current = Date.now();
      audioService.speak('Recording your music!');
    } else {
      setIsRecording(false);
      audioService.speak('Recording saved!');
    }
  };

  const handlePlaybackRecording = () => {
    if (recordedNotes.length === 0) return;
    recordedNotes.forEach((item) => {
      setTimeout(() => {
        audioService.playInstrumentSound(item.noteIndex, instrument);
      }, item.time);
    });
  };

  // Generate new AI song using server-side endpoint
  const handleGenerateAiSong = async () => {
    setIsGeneratingSong(true);
    audioService.playPop();
    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: musicTheme,
          type: 'nursery_song',
          instrument: instrument
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const newSong: NurserySong = data.song || data;
      setAllSongs(prev => [newSong, ...prev]);
      setActiveSong(newSong);
      setShowAiModal(false);
      audioService.playSuccess();
      confetti({ particleCount: 50, spread: 70 });
      audioService.speak(`New song composed: ${newSong.title}!`);
    } catch (err) {
      console.error('Failed to generate music via AI API:', err);
      // Fallback melody
      const fallbackSong: NurserySong = {
        id: `song-custom-${Date.now()}`,
        title: `The ${musicTheme} Song`,
        type: 'poem',
        icon: '🎶',
        theme: musicTheme,
        lyrics: `Dancing flowers in the sun, Wonder Meadow has begun! Sing with friends both big and small, music brings delight to all!`,
        melodyNotes: [0, 2, 4, 5, 4, 2, 0, 4, 5, 4, 2, 0],
        tempoBpm: 95
      };
      setAllSongs(prev => [fallbackSong, ...prev]);
      setActiveSong(fallbackSong);
      setShowAiModal(false);
      audioService.playSuccess();
    } finally {
      setIsGeneratingSong(false);
    }
  };

  return (
    <div id="music-bells-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
      {/* Header with Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 font-extrabold transition-all text-sm shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>Back to Meadow</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-display font-black text-xl shadow-xs">
              🎵
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Music Bells & Chimes
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Play colorful bells, sing along, and make tunes!
              </p>
            </div>
          </div>
        </div>

        {/* AI Composer Trigger & Notes count */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playPop();
              setShowAiModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-display font-black text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Make New Song</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Notes: {notesPlayedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Music Area: Instrument selector + Songs Shelf + 8 Note Chimes */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Instruments & Song Playlist */}
        <div className="lg:col-span-4 space-y-4">
          {/* Instrument Selector */}
          <div>
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-2">
              Choose Sound:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['xylophone', 'piano', 'bells', 'drum'] as MusicInstrumentType[]).map((inst) => (
                <button
                  key={inst}
                  onClick={() => {
                    setInstrument(inst);
                    audioService.playPop();
                  }}
                  className={`p-2.5 rounded-2xl font-extrabold text-xs capitalize transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                    instrument === inst
                      ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-xs'
                      : 'bg-[#FAF8F5] hover:bg-purple-50 border-amber-200 text-stone-700'
                  }`}
                >
                  <span>{inst === 'xylophone' ? '🌸' : inst === 'piano' ? '🎹' : inst === 'bells' ? '🔔' : '🥁'}</span>
                  <span>{inst}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Songs & Rhymes Shelf */}
          <div>
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-2">
              Songs:
            </span>
            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
              {allSongs.map((song) => {
                const isSelected = activeSong.id === song.id;
                return (
                  <button
                    key={song.id}
                    onClick={() => {
                      setActiveSong(song);
                      setIsPlayingSong(false);
                      setCurrentSongNoteIndex(-1);
                      audioService.playPop();
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left transition-all border-2 flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 shadow-xs ring-2 ring-purple-200'
                        : 'bg-[#FAF8F5] hover:bg-[#FFFDF7] border-amber-200'
                    }`}
                  >
                    <span className="text-xl">{song.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-black text-xs text-stone-900 truncate">
                        {song.title}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate font-medium">
                        {song.theme || 'Meadow Song'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Record & Playback Tool */}
          <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2">
            <button
              onClick={handleToggleRecord}
              className={`flex-1 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#FFFDF7] hover:bg-amber-100 text-stone-700 border border-amber-200 shadow-xs'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? 'Stop Recording' : 'Record Notes'}</span>
            </button>
            <button
              onClick={handlePlaybackRecording}
              disabled={recordedNotes.length === 0 || isRecording}
              className="px-3 py-2 rounded-xl bg-[#FFFDF7] hover:bg-amber-100 text-stone-700 font-extrabold text-xs border border-amber-200 shadow-xs disabled:opacity-40 cursor-pointer"
            >
              Play Back
            </button>
          </div>
        </div>

        {/* Right Column: Active Song Lyrics & 8 Rainbow Chime Bars */}
        <div className="lg:col-span-8 space-y-4">
          {/* Song Lyrics & Auto-Play Box */}
          <div className="bg-gradient-to-br from-amber-50/80 to-purple-50/70 p-5 rounded-3xl border-2 border-amber-200/80 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display font-black text-stone-900 text-base md:text-lg flex items-center gap-2">
                  <span>{activeSong.icon}</span>
                  <span>{activeSong.title}</span>
                </h3>
                {activeSong.learningObjective && (
                  <p className="text-xs text-purple-800 font-bold">
                    {activeSong.learningObjective}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReadLyrics}
                  className="px-3 py-1.5 rounded-full bg-[#FFFDF7] hover:bg-purple-100 text-purple-800 font-extrabold text-xs shadow-xs border border-amber-200 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Lyrics</span>
                </button>

                <button
                  onClick={handlePlayFollowSong}
                  className={`px-4 py-1.5 rounded-full text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    isPlayingSong ? 'bg-rose-500 hover:bg-rose-600' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isPlayingSong ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingSong ? 'Stop Song' : 'Play Song'}</span>
                </button>
              </div>
            </div>

            <p className="text-sm md:text-base text-stone-800 font-medium leading-relaxed bg-[#FFFDF7] p-3.5 rounded-2xl border border-amber-100">
              "{activeSong.lyrics}"
            </p>
          </div>

          {/* 8 Rainbow Musical Chime Bars */}
          <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/80">
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-3 text-center">
              Tap the Rainbow Chimes:
            </span>
            <div className="grid grid-cols-8 gap-1.5 md:gap-2.5 h-48 md:h-56 items-end">
              {MUSIC_NOTES.map((note, idx) => {
                const isLit = currentSongNoteIndex === idx;
                const heightPercent = 45 + (idx * 7);

                return (
                  <button
                    key={note.pitch}
                    onClick={() => handlePlayNote(idx)}
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: note.colorHex
                    }}
                    className={`rounded-2xl transition-all flex flex-col items-center justify-between p-2 text-white font-display font-black shadow-md active:scale-95 cursor-pointer transform ${
                      isLit ? 'scale-105 ring-4 ring-white shadow-xl brightness-125' : 'hover:brightness-110'
                    }`}
                  >
                    <span className="text-xs md:text-sm">{note.pitch}</span>
                    <span className="text-sm md:text-base">{note.solfege}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Music Composer Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-violet-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4 text-violet-700 font-display font-extrabold text-lg">
              <Wand2 className="w-5 h-5" />
              <span>AI Song & Rhyme Composer</span>
            </div>
            <p className="text-xs text-stone-600 mb-4">
              Select a theme and mood to compose a brand new interactive melody:
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Meadow Theme:</label>
                <select
                  value={musicTheme}
                  onChange={(e) => setMusicTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  <option value="Butterflies & Wildflowers">Butterflies & Wildflowers 🦋</option>
                  <option value="Raindrops on Lily Pads">Raindrops on Lily Pads 💧</option>
                  <option value="Baby Bear's Lullaby">Baby Bear's Lullaby 🐻</option>
                  <option value="Happy Meadow Parade">Happy Meadow Parade 🥁</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Musical Mood:</label>
                <select
                  value={musicMood}
                  onChange={(e) => setMusicMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  <option value="cheerful">Cheerful & Upbeat ☀️</option>
                  <option value="gentle">Gentle & Soothing 🌙</option>
                  <option value="playful">Playful & Bouncy 🎈</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiSong}
                disabled={isGeneratingSong}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isGeneratingSong ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Composing Melody...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compose Song</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
