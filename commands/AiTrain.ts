import _ from 'lodash'
import { BaseCommand } from '@adonisjs/core/build/standalone'
import DataService from 'App/Service/DataService'

export default class AiTrain extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'ai:train'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const { default: Drive } = await import('@ioc:Adonis/Core/Drive')
    const { default: FaceAPI } = await import('@ioc:FaceAPI')
    const { default: Face } = await import('App/Models/Face')
    const { default: Application } = await import('@ioc:Adonis/Core/Application')
    this.logger.info('Start Training AI')

    const directories = await Drive.list('faces').toArray()
    this.logger.info(`Found ${directories.length} faces`)

    for (const directory of directories) {
      if (directory.isFile) continue
      this.logger.info(`Training dataset ${directory.original.name}`)
      const files = await Drive.list(`faces/${directory.original.name}`).toArray()
      for (const file of files) {
        if (!_.endsWith(file.original.name, '.png')) continue
        this.logger.info(`Training image ${file.original.name}`)
        const detected = await FaceAPI.detect(
          Application.tmpPath(`uploads/faces/${directory.original.name}/${file.original.name}`)
        )
        if (detected.face.length === 0) {
          console.log('No faces detected')
          continue
        }
        const face = new Face()
        face.name = directory.original.name
        face.data = detected.face[0].embedding?.toString() || ''
        await face.save()
      }
      this.logger.info(`Finished training dataset ${directory.original.name}`)
    }

    this.logger.info('Finished training AI data')
  }
}
