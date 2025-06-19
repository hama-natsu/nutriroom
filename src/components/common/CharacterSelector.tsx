'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const characters = [
  {
    id: 'akari',
    name: 'あかり',
    description: '元気系応援栄養士',
    image: '/images/characters/akari-room-full.png', // あかりも統一
    theme: 'pink',
    route: '/akari-prototype'
  },
  {
    id: 'minato', 
    name: 'みなと',
    description: 'ツンデレ系スパルタ栄養士',
    image: '/images/characters/minato-room-full.png', // 正しいファイル名
    theme: 'blue',
    route: '/minato-prototype'
  }
];

export function CharacterSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          NutriRoom - AI栄養士を選択
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          あなたの目標に合わせて、最適な栄養士を選んでください
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {characters.map((character) => (
            <Link 
              key={character.id}
              href={character.route}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    {character.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {character.description}
                  </p>
                  
                  <div className={`inline-flex items-center px-6 py-3 rounded-full text-white font-medium transition-all duration-300 ${
                    character.theme === 'pink' 
                      ? 'bg-pink-500 hover:bg-pink-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}>
                    相談する
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            各キャラクターは異なるアプローチで栄養指導を行います
          </p>
        </div>
      </div>
    </div>
  );
}