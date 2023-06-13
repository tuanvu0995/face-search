import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Database from '@ioc:Adonis/Lucid/Database'
import FaceAPI from './FaceAPI'
import _ from 'lodash'
import { FaceData } from '@ioc:FaceAPI'

export default class FaceApiProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
    this.app.container.singleton('FaceAPI', () => {
      return new FaceAPI()
    })
  }

  public async boot() {}

  public async ready() {
    const Logger = this.app.container.resolveBinding('Adonis/Core/Logger')
    try {
      // App is ready
      const { default: Face } = await import('App/Models/Face')
      const FaceAPI = this.app.container.use('FaceAPI')
      Logger.info('FaceAPI database loading')

      const allFaces = await Face.all()
      if (!allFaces.length) {
        Logger.info('FaceAPI database empty')
        return
      }

      const faceData: FaceData[] = allFaces.map((face) => ({
        label: face.name,
        embeddings: _.map(_.split(face.data, ','), parseFloat),
      }))

      FaceAPI.setFaceData(faceData)
      Logger.info('FaceAPI database loaded')
    } catch (e) {
      Logger.warn(e.message)
    }
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
