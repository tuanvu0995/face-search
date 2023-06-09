import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new BadRequestException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
const status = 400
const code = 'E_BAD_REQUEST_EXCEPTION'

export default class BadRequestException extends Exception {
  constructor(message: string = 'Bad Request Exception') {
    super(message, status, code)
  }
}
