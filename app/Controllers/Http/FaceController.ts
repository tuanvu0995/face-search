import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FaceAPI from '@ioc:FaceAPI'
import { nanoid } from 'nanoid'
import _ from 'lodash'
import DataService from 'App/Service/DataService'
import BadRequestException from 'App/Exceptions/BadRequestException'
import uniqid from 'uniqid'
import * as UID from 'App/Utils/UID'
import Face from 'App/Models/Face'

export default class FaceController {
  public async test({ response }: HttpContextContract) {
    const path = Application.tmpPath('uploads/faces/it5q12welin5p5dh/it5q12welin5p6ct.png')
    const tensor = await FaceAPI.detect(path)
    return response.json(tensor)
  }

  public async prepare({ request, response }: HttpContextContract) {
    const images = request.files('images', {
      size: '10mb',
      extnames: ['png', 'jpg', 'jpeg'],
    })

    if (_.isEmpty(images)) {
      throw new BadRequestException('No images found')
    }

    const datasetUid = UID.generate()
    for (let image of images) {
      if (!image.isValid) continue
      const fileName = uniqid() + '.png'
      await image.move(Application.tmpPath('uploads/' + datasetUid), { name: fileName })
      await DataService.prepareImage(fileName, datasetUid)
    }

    return response.json({ message: 'success', datasetUid: datasetUid })
  }

  public async train({ request, response }: HttpContextContract) {
    const dataset = request.input('dataset').trim()
    const uid = request.input('uid').trim()

    const imagePaths = await DataService.getImagePathFromDatasetUid(dataset)

    for (const imagePath of imagePaths) {
      const detected = await FaceAPI.detect(Application.tmpPath('uploads/' + imagePath))
      if (detected.face.length === 0) {
        console.log('No faces detected')
        continue
      }
      const face = new Face()
      face.name = uid
      face.data = detected.face[0].embedding?.toString() || ''
      await face.save()
    }

    return response.json({
      success: true,
    })
  }

  public async recognize({ request, response }: HttpContextContract) {
    const image = request.file('image', {
      size: '10mb',
      extnames: ['png', 'jpg', 'jpeg'],
    })

    if (!image) {
      return
    }

    if (!image.isValid) {
      return image.errors
    }

    const fileName = nanoid() + '.png'
    await image.move(Application.tmpPath('uploads/images'), { name: fileName })
    const filePath = Application.tmpPath('uploads/images') + '/' + fileName

    const tensor = await FaceAPI.detect(filePath)
    const result = await FaceAPI.find(tensor.face[0])
    return response.json(result)
  }
}
