// ハイブリッド音声システム（ElevenLabs + 録音音声）

import { TimeSlot, getCurrentTimeSlot, getTimeSlotGreeting } from './time-greeting';
import { generateVoice } from './audio-utils';

export interface HybridGreetingConfig {
  character: 'akari'; // 現在はあかりのみ対応
  userName?: string;
  timeSlot?: TimeSlot; // 指定なしの場合は自動判定
}

export class HybridAudioEngine {
  private baseAudioPath = '/audio/recorded';

  // メイン機能：ハイブリッド音声生成
  async generateHybridGreeting(config: HybridGreetingConfig): Promise<Blob> {
    const timeSlot = config.timeSlot || getCurrentTimeSlot();
    
    console.log('🎵 Hybrid Audio Generation:', {
      character: config.character,
      userName: config.userName,
      timeSlot,
      greeting: getTimeSlotGreeting(timeSlot)
    });

    try {
      const audioParts: Blob[] = [];

      // 1. ユーザー名がある場合：ElevenLabsで名前読み上げ
      if (config.userName) {
        console.log('🎤 Generating name part with ElevenLabs...');
        const namePart = await this.generateNamePart(config.userName, config.character);
        audioParts.push(namePart);
        
        // 短い無音を追加（自然な間を作る）
        const silence = await this.generateSilence(0.1); // 100ms
        audioParts.push(silence);
      }

      // 2. 録音音声を読み込み
      console.log('🎵 Loading recorded greeting...');
      const recordedPart = await this.loadRecordedGreeting(config.character, timeSlot);
      audioParts.push(recordedPart);

      // 3. 音声を連結
      console.log('🔗 Combining audio parts...');
      const finalAudio = await this.combineAudioBlobs(audioParts);
      
      console.log('✅ Hybrid audio generation completed:', {
        totalParts: audioParts.length,
        finalSize: finalAudio.size
      });
      
      return finalAudio;

    } catch (error) {
      console.error('❌ Hybrid audio generation failed:', error);
      
      // フォールバック：ElevenLabsで全文生成
      return this.generateFallbackAudio(config, timeSlot);
    }
  }

  // ElevenLabsでユーザー名読み上げ
  private async generateNamePart(userName: string, character: string): Promise<Blob> {
    // 名前に「、」を付けて自然な区切りにする
    const nameText = `${userName}、`;
    
    console.log('🎤 Generating name with ElevenLabs:', nameText);
    
    try {
      return await generateVoice(nameText, character);
    } catch (error) {
      console.error('❌ Name generation failed:', error);
      throw error;
    }
  }

  // 録音音声読み込み
  private async loadRecordedGreeting(character: string, timeSlot: TimeSlot): Promise<Blob> {
    const audioPath = `${this.baseAudioPath}/${character}/${timeSlot}.mp3`;
    
    console.log('📁 Loading recorded audio:', audioPath);
    
    try {
      const response = await fetch(audioPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load recorded audio: ${response.status} ${response.statusText}`);
      }
      
      const audioBlob = await response.blob();
      
      console.log('✅ Recorded audio loaded:', {
        path: audioPath,
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      return audioBlob;
      
    } catch (error) {
      console.error('❌ Failed to load recorded audio:', error);
      throw error;
    }
  }

  // 短い無音生成（WAV形式）
  private async generateSilence(durationSeconds: number): Promise<Blob> {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const arrayBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(arrayBuffer);

    // WAVヘッダー
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // 無音データ（すべて0）
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // 音声合成（連結）- Web Audio APIを使用
  private async combineAudioBlobs(blobs: Blob[]): Promise<Blob> {
    if (blobs.length === 0) {
      throw new Error('No audio blobs to combine');
    }
    
    if (blobs.length === 1) {
      return blobs[0];
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const audioBuffers: AudioBuffer[] = [];

      // 各Blobをデコード
      for (const blob of blobs) {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
      }

      // 合計時間を計算
      const totalDuration = audioBuffers.reduce((sum, buffer) => sum + buffer.duration, 0);
      const sampleRate = audioBuffers[0].sampleRate;
      const totalSamples = Math.floor(totalDuration * sampleRate);

      // 合成用のバッファを作成
      const combinedBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
      const combinedData = combinedBuffer.getChannelData(0);

      // 音声を連結
      let offset = 0;
      for (const buffer of audioBuffers) {
        const channelData = buffer.getChannelData(0);
        combinedData.set(channelData, offset);
        offset += channelData.length;
      }

      // AudioBufferをBlobに変換
      const wavBlob = await this.audioBufferToBlob(combinedBuffer);
      
      console.log('🔗 Audio combination completed:', {
        inputBlobs: blobs.length,
        totalDuration: totalDuration.toFixed(2) + 's',
        outputSize: wavBlob.size
      });
      
      return wavBlob;

    } catch (error) {
      console.error('❌ Audio combination failed:', error);
      
      // フォールバック：最初のBlobのみ返す
      console.log('⚠️ Using fallback: returning first audio blob only');
      return blobs[0];
    }
  }

  // AudioBufferをWAV Blobに変換
  private async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const numChannels = 1;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    // WAVヘッダー
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // 音声データ
    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // フォールバック：ElevenLabsで全文生成
  private async generateFallbackAudio(config: HybridGreetingConfig, timeSlot: TimeSlot): Promise<Blob> {
    console.log('🔄 Using ElevenLabs fallback for full greeting...');
    
    const greeting = getTimeSlotGreeting(timeSlot);
    const fullText = config.userName ? `${config.userName}、${greeting}` : greeting;
    
    try {
      const fallbackAudio = await generateVoice(fullText, config.character);
      console.log('✅ Fallback audio generated successfully');
      return fallbackAudio;
    } catch (error) {
      console.error('❌ Fallback audio generation also failed:', error);
      throw error;
    }
  }

  // 録音音声のみ再生（フォールバック用）
  async generateRecordedOnly(character: string, timeSlot?: TimeSlot): Promise<Blob> {
    const slot = timeSlot || getCurrentTimeSlot();
    console.log('🎵 Generating recorded-only greeting:', { character, timeSlot: slot });
    
    try {
      return await this.loadRecordedGreeting(character, slot);
    } catch (error) {
      console.error('❌ Recorded-only generation failed:', error);
      throw error;
    }
  }
}

// 便利関数：ハイブリッド音声再生
export async function playHybridGreeting(userName?: string, timeSlot?: TimeSlot): Promise<void> {
  const hybridEngine = new HybridAudioEngine();
  
  try {
    const audioBlob = await hybridEngine.generateHybridGreeting({
      character: 'akari',
      userName,
      timeSlot
    });
    
    // 再生
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('🔇 Hybrid greeting playback completed');
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        console.error('❌ Hybrid greeting playback failed:', error);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
    
  } catch (error) {
    console.error('❌ Hybrid greeting failed:', error);
    throw error;
  }
}

// デバッグ用関数
export const debugHybridSystem = () => {
  console.log('🔍 Hybrid Audio System Debug:');
  console.log('=' .repeat(50));
  console.log('Available Characters: akari');
  console.log('Base Audio Path: /audio/recorded');
  console.log('Supported Time Slots: morning, afternoon, evening, night');
  console.log('Audio Context Support:', !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext));
  console.log('Fetch API Support:', !!window.fetch);
  console.log('Blob Support:', !!window.Blob);
  console.log('URL Support:', !!window.URL);
};