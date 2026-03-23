import type { Machine, MultiMachineState, Settings } from '../types'

export const PROFILES_STORAGE_KEY = 'fourierfun_profiles'

export type ProfileSnapshot = MultiMachineState & {
  settings: Settings
}

export function stripMachineForStorage(m: Machine): Machine {
  return {
    ...m,
    curveData: {
      ...m.curveData,
      backgroundImage: null,
      processedImage: null
    }
  }
}

export function loadProfilesMap(): Record<string, ProfileSnapshot> {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, ProfileSnapshot>
  } catch {
    return {}
  }
}

export function saveProfileToStorage(name: string, snapshot: ProfileSnapshot): void {
  const map = loadProfilesMap()
  const serializable: ProfileSnapshot = {
    ...snapshot,
    machines: snapshot.machines.map(stripMachineForStorage)
  }
  map[name] = serializable
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(map))
}

export function deleteProfileFromStorage(name: string): void {
  const map = loadProfilesMap()
  delete map[name]
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(map))
}

export function listProfileNames(): string[] {
  return Object.keys(loadProfilesMap())
}
