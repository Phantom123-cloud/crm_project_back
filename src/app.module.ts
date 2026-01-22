import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LoggerModule } from './common/logger/logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RoleTypesModule } from './role-types/role-types.module';
import { RoleTemplatesModule } from './role-templates/role-templates.module';
import { RolesModule } from './roles/roles.module';
import { CitizenshipsModule } from './citizenships/citizenships.module';
import { LanguagesModule } from './languages/languages.module';
import { EmployeesModule } from './employees/employees.module';
import { UploadsModule } from './uploads/uploads.module';
import { FilesModule } from './files/files.module';
// import { ScheduleModule } from '@nestjs/schedule';
// import { CronModule } from './cron/cron.module';
// import { AppGatewayModule } from './gateway/app.gateway.module';
import { TripsModule } from './trips/trips.module';
import { TripTypesModule } from './trip-types/trip-types.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ProductsModule } from './products/products.module';
import { PlacesModule } from './cities/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    // ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    RolesModule,
    UsersModule,
    LoggerModule,
    RoleTypesModule,
    RoleTemplatesModule,
    CitizenshipsModule,
    LanguagesModule,
    EmployeesModule,
    UploadsModule,
    FilesModule,
    TripsModule,
    TripTypesModule,
    WarehousesModule,
    ProductsModule,
    PlacesModule,
    // CronModule,
    // AppGatewayModule,
  ],

  // controllers: [AppController],
  // providers: [AppGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
