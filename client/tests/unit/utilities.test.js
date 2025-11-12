import { expect, test } from 'vitest'
import { isFeatureorMapService } from '../../src/shared/utilities.js'

test('is Feature or Map Service', () => {
    expect(isFeatureorMapService('')).toBe(false)
    expect(isFeatureorMapService('https://enviroatlas.epa.gov/arcgis/rest/services/Rasters/Dasymetric_2020/ImageServer')).toBe(false)
    expect(isFeatureorMapService('https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Acresofpollinatedcropswithnonearbypollinatorhabitat/FeatureServer')).toBe(true)
})