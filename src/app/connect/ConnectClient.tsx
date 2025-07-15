'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { serverRegistryAPI } from '@/utils/serverRegistry'
import { setCookie } from '@/utils/cookies'

const ConnectClient: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, userId } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleTokenConnect = async (tokenValue: string) => {
    if (!userId) return false

    try {
      const result = await serverRegistryAPI.linkServer(tokenValue, userId)
      if (result.success) {
        const serverInfo = await serverRegistryAPI.getUserServer(userId)
        if (serverInfo.success && serverInfo.data) {
          const settings = {
            serverToken: serverInfo.data.bridge_url,
            visionMode: 'normal'
          }
          setCookie('userSettings', JSON.stringify(settings))
        }
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Error linking server:', error)
      return false
    }
  }

  useEffect(() => {
    const processToken = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tokenParam = searchParams.get('token')

      if (!tokenParam) {
        setError('Token invalid or missing')
        setIsProcessing(false)
        return
      }

      if (!isSignedIn) {
        setError('Sign in first')
        setIsProcessing(false)
        return
      }

      setToken(tokenParam)
      console.log('Extracted token from URL:', token);

      try {
        const success = await handleTokenConnect(tokenParam)
        if (success) {
          setTimeout(() => {
            setIsProcessing(false)
            router.push('/')
          }, 1000)
        } else {
          setError('Failed to link server')
          setIsProcessing(false)
        }
      } catch (error) {
        console.error('Error processing token:', error)
        setError('Error processing token')
        setIsProcessing(false)
      }
    }

    processToken().then(() => null)
  }, [searchParams, isSignedIn, router, token])

  return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400">Проверка токена...</p>
              </div>
          ) : error ? (
              <div className="space-y-4">
                <div className="bg-red-600 text-white p-3 rounded">{error}</div>
                <button
                    onClick={() => router.push('/')}
                    className="bg-green-900 text-white p-3 rounded px-4 py-2"
                >
                  Попробуйте ввести токен вручную
                </button>
              </div>
          ) : (
              <div className="space-y-4">
                <div className="bg-green-600 text-white p-3 rounded">Токен подтвержден</div>
              </div>
          )}
        </div>
      </div>
  )
}

export default ConnectClient
