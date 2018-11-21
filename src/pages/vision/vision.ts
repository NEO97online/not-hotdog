import { Component } from '@angular/core'
import { IonicPage, LoadingController, Loading } from 'ionic-angular'
import { Camera, CameraOptions } from '@ionic-native/camera'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage'
import { AngularFirestore } from 'angularfire2/firestore'
import { Observable } from 'rxjs/Observable'
import { tap, filter } from 'rxjs/operators'

@IonicPage()
@Component({
  selector: 'page-vision',
  templateUrl: 'vision.html',
})
export class VisionPage {

  task: AngularFireUploadTask

  result$: Observable<any>

  loading: Loading
  image: string

  constructor(
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private camera: Camera,
    private loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create({
      content: 'Analyzing image structure for traces of hotdog...'
    })
  }

  startUpload(file: string) {
    this.loading.present()

    const docId = this.afs.createId()
    const path = `${docId}.jpg`
    const photoRef = this.afs.collection('photos').doc(docId)

    this.result$ = photoRef.valueChanges()
      .pipe(
        filter(data => !!data),
        tap(_ => this.loading.dismiss())
      )

    this.image = 'data:image/jpg;base64,' + file
    this.task = this.storage.ref(path).putString(this.image, 'data_url')
  }

  async captureAndUpload() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    }

    const base64 = await this.camera.getPicture(options)

    this.startUpload(base64)
  }

}
