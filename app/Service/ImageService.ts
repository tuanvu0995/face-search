import fs from 'fs'
import sharp from 'sharp'
import { createCanvas, loadImage, Canvas } from 'canvas'
import { FaceResult } from '@vladmandic/human'

class ImageService {
  public getImageBufferFromPath(path: string): Buffer {
    return fs.readFileSync(path)
  }

  public async createCanvas(
    buffer: string | Buffer,
    width: number,
    height: number
  ): Promise<Canvas> {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const image = await loadImage(buffer)
    ctx.drawImage(image, 0, 0, width, height)
    return canvas
  }

  public async getImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return await sharp(buffer).metadata()
  }

  public createFaceCanvas(canvas: Canvas, face: FaceResult): Canvas {
    const [x, y, width, height] = face.box
    const faceCanvas = createCanvas(width, height)
    const ctx = faceCanvas.getContext('2d')
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height)
    return faceCanvas
  }

  public async cleanup(stream: any) {
    return await sharp(stream).gamma().grayscale().toBuffer()
  }
}

export default new ImageService()
