declare module '@ioc:FaceAPI' {
  import FaceAPIClass from 'Providers/FaceAPI/FaceAPI'

  export interface FaceData {
    label: string
    embeddings: number[]
  }

  const FaceAPI: FaceAPIClass
  export default FaceAPI
}
