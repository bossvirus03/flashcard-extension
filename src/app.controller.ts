import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('hello')
  getHello() {
    return {
      name: 'Flashcard Extension API',
      description: 'A spaced-repetition flashcard backend with Google login and progress tracking.',
      version: '1.0.0',
      docs: '/hello',
      status: 'ok',
    };
  }
}
