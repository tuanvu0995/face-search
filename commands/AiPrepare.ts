import _ from 'lodash'
import { BaseCommand } from '@adonisjs/core/build/standalone'
import DataService from 'App/Service/DataService'

export default class AiPrepare extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'ai:prepare'

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
    this.logger.info('Start preparing AI data')

    const directories = await Drive.list('datasets').toArray()
    this.logger.info(`Found ${directories.length} datasets`)

    for (const directory of directories) {
      if (directory.isFile) continue
      this.logger.info(`Preparing dataset ${directory.original.name}`)
      const files = await Drive.list(`datasets/${directory.original.name}`).toArray()
      for (const file of files) {
        if (!_.endsWith(file.original.name, '.jpg')) continue
        this.logger.info(`Preparing image ${file.original.name}`)
        await DataService.prepareImageV2(file.original.name, directory.original.name)
      }
      this.logger.info(`Finished preparing dataset ${directory.original.name}`)
    }

    this.logger.info('Finished preparing AI data')
  }
}
