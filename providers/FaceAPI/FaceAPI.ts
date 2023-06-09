import '@tensorflow/tfjs-node'
import fs from 'fs'
import * as _ from 'lodash'
import Human, { FaceResult, Result } from '@vladmandic/human'
import { FaceData } from '@ioc:FaceAPI'
import Logger from '@ioc:Adonis/Core/Logger'
import BadRequestException from 'App/Exceptions/BadRequestException'

export default class FaceAPI {
  public faceAPI: any

  private human: Human
  private faces: FaceData[] = []

  private config = {
    body: { enabled: false },
    face: {
      enabled: true,
      detector: { rotation: true, return: true },
      mesh: { enabled: true },
      description: { enabled: true },
    },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: false },
    segmentation: { enabled: false },
  }

  constructor() {
    this.human = new Human(this.config)
  }

  public async detect(input: string | Buffer): Promise<Result> {
    const buffer = this.getBufferFromInput(input)
    const tensor = this.human.tf.node.decodeImage(buffer)
    const result = await this.human.detect(tensor)
    return result
  }

  private getBufferFromInput(input: string | Buffer): Buffer {
    if (_.isBuffer(input)) return input as Buffer
    return fs.readFileSync(input)
  }

  public setFaceData(faceData: FaceData[]): void {
    this.faces = faceData
  }

  public find(face: FaceResult) {
    if (_.isNil(face?.embedding)) {
      throw new BadRequestException('Input face does not have an embedding')
    }
    const best = this.human.match.find(face.embedding, this.getEmbeddings())
    const label = this.faces[best.index].label

    const result = { name: label, similarity: best.similarity }

    return result
  }

  private getEmbeddings(): number[][] {
    return _.map(this.faces, (face) => face.embeddings)
  }
}
