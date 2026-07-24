import assert from 'node:assert/strict'
import { normalizeOpenChargeMapStations } from './openChargeMap'

const result = normalizeOpenChargeMapStations([
  {
    ID: 42,
    AddressInfo: { Latitude: 33.68, Longitude: -117.79 },
    OperatorInfo: { Title: '  ChargePoint   Network ' },
  },
  { ID: 43, AddressInfo: { Latitude: null, Longitude: -117.8 } },
  { AddressInfo: { Latitude: 33.7, Longitude: -117.8 } },
])

assert.deepEqual(result, [{
  stationId: 42,
  operatorName: 'ChargePoint Network',
  latitude: 33.68,
  longitude: -117.79,
}])

