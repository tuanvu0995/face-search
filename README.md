# Face Recognize Service

> A face recognize service based on [@vladmandic/human](https://github.com/vladmandic/human).

## Features
- [x] Face detection
- [x] Face recognition

## Usage
### Install
```bash
git clone https://github.com/tuanvu0995/face-search.git
cd face-search
npm install
cp .env.example .env
```

### Database preparation

Update `.env` file with your own database.
```env
DB_CONNECTION=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DB_NAME=face_search
```

Note: you can use sqlite, mysql, postgresql, mssql. [See more](https://docs.adonisjs.com/guides/database/introduction)

In the root directory, run the following command:
```bash
node ace migration:run
```

### Prepare face images and labels

In the root directory, create `tmp/uploads/datasets` directory and put your face images in it. The directory structure should be like this:
```
./tmp/uploads/datasets
    - elon_musk
        - image1.jpg
        - image2.jpg
        - ...
    - bill_gate
        - image1.jpg
        - image2.jpg
        - ...
```

If all ready, run the following command to prepare face so that we can use it for face recognition.
```bash
node ace ai:prepare
```

When the command is done, we can label the face images by running the following command:
```bash
node ace ai:train
```

Done.

### Start server
```bash
npm run start
```

### API

/v1/recognize
- Method: POST
- Body type: form-data
- Body:
    - image: image file

Response:
```json
{
  "name": "kaho-uchikawa",
  "similarity": 0.6668692096709383
}
```

/v1/prepare
- Method: POST
- Body type: form-data
- Body:
    - images: image file
- Response:
```json
{
  "message": "success",
  "datasetUid": "it5r3cvlj5rpkja"
}
```

/v1/train
- Method: POST
- Body:
    - dataset: dataset uid
    - uid: face label
- Response:
```json
{
  "success": true
}
```

## License
MIT