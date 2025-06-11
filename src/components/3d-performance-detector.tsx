'use client'

import { useEffect, useState } from 'react'

interface PerformanceInfo {
  isSupported: boolean
  isMobile: boolean
  isLowPower: boolean
  shouldEnable3D: boolean
}

export function usePerformanceDetector(): PerformanceInfo {
  const [performanceInfo, setPerformanceInfo] = useState<PerformanceInfo>({
    isSupported: false,
    isMobile: false,
    isLowPower: false,
    shouldEnable3D: false
  })

  useEffect(() => {
    const detectPerformance = () => {
      // WebGL サポート検出
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      const isWebGLSupported = !!gl

      // モバイル端末検出
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )

      // メモリ情報取得（利用可能な場合）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (navigator as any).deviceMemory
      const isLowMemory = memory && memory < 4 // 4GB未満は低メモリ

      // CPU コア数取得
      const cores = navigator.hardwareConcurrency || 2
      const isLowCPU = cores < 4

      // バッテリー情報（利用可能な場合）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const battery = (navigator as any).getBattery
      let isLowBattery = false

      if (battery) {
        battery().then((batteryInfo: { level: number; charging: boolean }) => {
          isLowBattery = !batteryInfo.charging && batteryInfo.level < 0.3
        }).catch(() => {
          // バッテリー情報取得失敗時は無視
        })
      }

      // ネットワーク速度（利用可能な場合）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connection = (navigator as any).connection
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g'
      )

      // 総合的な判断
      const isLowPower = isLowMemory || isLowCPU || isLowBattery || isSlowConnection

      // 3D機能を有効にするかの判断
      const shouldEnable3D = isWebGLSupported && !isLowPower && (
        !isMobile || // デスクトップは基本的にOK
        (!isLowMemory && !isLowCPU) // モバイルでも高性能なら有効
      )

      setPerformanceInfo({
        isSupported: isWebGLSupported,
        isMobile,
        isLowPower,
        shouldEnable3D
      })

      // デバッグ情報（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Performance Detection:', {
          webGLSupported: isWebGLSupported,
          isMobile,
          memory: memory || 'unknown',
          cores,
          isLowPower,
          shouldEnable3D,
          userAgent: navigator.userAgent
        })
      }
    }

    detectPerformance()
  }, [])

  return performanceInfo
}