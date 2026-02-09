import { useState, useEffect } from 'react'
import { Settings } from '../types'
import { saveSettings, loadSettings, getDefaultSettings } from '../utils/storage'

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(getDefaultSettings())

  // Load settings on mount
  useEffect(() => {
    const savedSettings = loadSettings()
    setSettings(prev => ({ ...prev, ...savedSettings }))
  }, [])

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return {
    settings,
    updateSetting
  }
}
