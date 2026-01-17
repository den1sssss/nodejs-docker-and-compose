import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('crash-test')
  crashTest() {
    setTimeout(() => {
      throw new Error('Сервер сейчас упадёт');
    }, 0);
  }

  @Get()
  getHello(): object {
    return {
      message: 'Welcome to KupiPodariDay API',
      version: '1.0.0',
      endpoints: {
        auth: {
          signup: 'POST /auth/signup',
          signin: 'POST /auth/signin',
        },
        users: {
          create: 'POST /users',
          profile: 'GET /users/me',
          update: 'PATCH /users/me',
          search: 'GET /users/search?query=...',
          findOne: 'GET /users/:id',
          wishes: 'GET /users/:id/wishes',
        },
        wishes: {
          latest: 'GET /wishes/latest',
          popular: 'GET /wishes/popular',
          create: 'POST /wishes',
          findOne: 'GET /wishes/:id',
          update: 'PATCH /wishes/:id',
          delete: 'DELETE /wishes/:id',
          copy: 'POST /wishes/:id/copy',
        },
        wishlists: {
          create: 'POST /wishlists',
          findAll: 'GET /wishlists',
          findOne: 'GET /wishlists/:id',
          update: 'PATCH /wishlists/:id',
          delete: 'DELETE /wishlists/:id',
        },
        offers: {
          create: 'POST /offers/:wishId',
          findWishOffers: 'GET /offers/wish/:wishId',
        },
      },
    };
  }
}
