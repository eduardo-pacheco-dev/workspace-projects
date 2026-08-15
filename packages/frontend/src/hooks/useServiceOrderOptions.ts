import { useState, useEffect } from 'react'
import api from '../services/api'
import { normalizeList } from '../utils/list'
import { ClientOption, StationOption, RadioLinkOption } from '../pages/service-orders/serviceOrdersTypes'

interface ServiceOrderOptions {
  clients: ClientOption[]
  stations: StationOption[]
  radioLinks: RadioLinkOption[]
}

export default function useServiceOrderOptions(open: boolean): ServiceOrderOptions {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [stations, setStations] = useState<StationOption[]>([])
  const [radioLinks, setRadioLinks] = useState<RadioLinkOption[]>([])

  useEffect(() => {
    if (!open) return

    api
      .get('/clients', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => setClients(normalizeList<ClientOption>(res.data).data))
      .catch(() => {})

    api
      .get('/stations', { params: { limit: 1000, sortBy: 'siteId', sortOrder: 'ASC' } })
      .then((res) => setStations(normalizeList<StationOption>(res.data).data))
      .catch(() => {})

    api
      .get('/radio-links', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => setRadioLinks(normalizeList<RadioLinkOption>(res.data).data))
      .catch(() => {})
  }, [open])

  return { clients, stations, radioLinks }
}
