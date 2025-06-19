import { CharacterSelector } from '@/components/common/CharacterSelector';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NutriRoom - AI栄養士チャットアプリ',
  description: '管理栄養士が開発したAI栄養士と音声で会話。あなたに最適な栄養指導を受けられます。',
  keywords: ['AI', '栄養士', 'チャット', '健康', 'ダイエット', '栄養指導'],
};

export default function HomePage() {
  return <CharacterSelector />;
}