import { useEffect, useState } from 'react'

export interface GeolocationCoords {
  lat: number
  lng: number
}

export type GeolocationState =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; coords: GeolocationCoords }
  | { status: 'error'; message: string }

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', message: 'Geolocalização não é suportada neste dispositivo.' })
      return
    }

    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
        })
      },
      () => {
        setState({
          status: 'error',
          message: 'Não foi possível acessar sua localização. Permita o acesso e tente novamente.',
        })
      },
      { timeout: 10000 },
    )
  }, [])

  return state
}
