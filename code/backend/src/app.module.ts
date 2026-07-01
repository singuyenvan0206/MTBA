import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MoviesModule } from './movies/movies.module';
import { GenresModule } from './genres/genres.module';
import { TheatersModule } from './theaters/theaters.module';
import { ScreensModule } from './screens/screens.module';
import { SeatsModule } from './seats/seats.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { NewsModule } from './news/news.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { PricesModule } from './prices/prices.module';
import { FestivalsModule } from './festivals/festivals.module';
import { PaymentsModule } from './payments/payments.module';
import { AgeLimitsModule } from './age-limits/age-limits.module';
import { PosModule } from './pos/pos.module';
import { RoomtypesModule } from './roomtypes/roomtypes.module';

@Module({
  imports: [PrismaModule, MoviesModule, GenresModule, TheatersModule, ScreensModule, SeatsModule, UsersModule, AuthModule, BookingsModule, VouchersModule, NewsModule, ShowtimesModule, PricesModule, FestivalsModule, PaymentsModule, AgeLimitsModule, PosModule, RoomtypesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
