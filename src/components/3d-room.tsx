'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'

// シンプルなローディングコンポーネント
function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">3D空間を読み込み中...</div>
    </div>
  )
}

// 3Dルーム環境コンポーネント
function Room() {
  return (
    <group>
      {/* 床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color="#f8f9fa" />
      </mesh>
      
      {/* 後壁 */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[10, 6]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* 左壁 */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 0, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* 右壁 */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 0, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ライティング設定
function Lighting() {
  return (
    <>
      {/* 環境光 - 全体を優しく照らす */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* メインライト - 上から */}
      <directionalLight
        position={[2, 8, 2]}
        intensity={0.8}
        color="#ffffff"
        castShadow={false} // パフォーマンス優先でシャドウ無効
      />
      
      {/* 補助ライト - 前から */}
      <directionalLight
        position={[0, 2, 5]}
        intensity={0.4}
        color="#ffffff"
      />
    </>
  )
}

interface ThreeDRoomProps {
  className?: string
}

export function ThreeDRoom({ className = '' }: ThreeDRoomProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={<Loading />}>
        <Canvas
          camera={{
            position: [0, 1, 4],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          performance={{
            // モバイル最適化設定
            min: 0.2, // 最低FPS（モバイル向けに下げる）
            max: 30,  // 最高FPS（モバイル向けに下げる）
            debounce: 400 // デバウンス時間（モバイル向けに増加）
          }}
          gl={{
            // WebGL設定 - モバイル最適化強化
            antialias: false, // アンチエイリアス無効でパフォーマンス向上
            alpha: true,
            powerPreference: 'low-power', // 省電力モード
            precision: 'lowp', // 低精度モード
            depth: false, // 深度バッファ無効化
            stencil: false, // ステンシルバッファ無効化
            preserveDrawingBuffer: false // 描画バッファ保持無効
          }}
          dpr={[1, 2]} // デバイスピクセル比制限
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        >
          <Lighting />
          <Room />
          
          {/* カメラコントロール - モバイル最適化 */}
          <OrbitControls
            enablePan={false} // パン無効
            enableZoom={true} // ズーム有効
            enableRotate={true} // 回転有効
            maxPolarAngle={Math.PI / 2.2} // 上下回転制限
            minDistance={2} // 最小距離
            maxDistance={8} // 最大距離
            autoRotate={false} // 自動回転無効
            dampingFactor={0.1} // モバイル向けにダンピング調整
            enableDamping={true}
            rotateSpeed={0.5} // 回転速度を下げる
            zoomSpeed={0.5} // ズーム速度を下げる
            touches={{
              ONE: 2, // タッチ1本で回転
              TWO: 0  // タッチ2本でズーム
            }}
          />
          
          {/* 環境マップ - 軽量設定 */}
          <Environment preset="apartment" />
        </Canvas>
      </Suspense>
    </div>
  )
}