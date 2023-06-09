import _ from 'lodash'
import Logger from '@ioc:Adonis/Core/Logger'
import FaceAPI from '@ioc:FaceAPI'
import ImageService from './ImageService'
import Drive from '@ioc:Adonis/Core/Drive'
import uniqid from 'uniqid'
import Application from '@ioc:Adonis/Core/Application'

class DataService {
  public async prepareImage(fileName: string, datasetUid: string): Promise<void> {
    const sourcePath = Application.tmpPath(`uploads/${datasetUid}/${fileName}`)

    const tensor = await FaceAPI.detect(sourcePath)
    if (_.isNil(tensor)) {
      Logger.info('No faces detected')
    }

    const sourceBuffer = await ImageService.getImageBufferFromPath(sourcePath)

    const { width, height } = await ImageService.getImageMetadata(sourceBuffer)
    if (!width || !height) throw new Error('Invalid image dimensions')

    const canvas = await ImageService.createCanvas(sourceBuffer, width, height)

    for (const face of tensor.face) {
      const faceCanvas = await ImageService.createFaceCanvas(canvas, face)
      const buffer = await ImageService.cleanup(faceCanvas.toBuffer())
      const faceImagePath = `faces/${datasetUid}/${uniqid()}.png`
      await Drive.put(faceImagePath, buffer)
    }
  }

  public async cleanupImage(imagePath: string): Promise<void> {
    const buffer = await Drive.get(imagePath)
    const cleaned = await ImageService.cleanup(buffer)
    return await Drive.put(imagePath, cleaned)
  }

  public async getImagePathFromDatasetUid(datasetUid: string): Promise<string[]> {
    const files = await Drive.list(`faces/${datasetUid}`)
    return _.map(await files.toArray(), 'location')
  }
}

export default new DataService()
