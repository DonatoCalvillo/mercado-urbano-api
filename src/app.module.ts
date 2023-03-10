import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [ 
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities:[],
      autoLoadEntities: true,
      synchronize: false, //In production most be FALSE
    }),
    AuthModule,
    CommonModule,
    UserModule,
    EventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
