-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_showtimeId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `bookingseat` DROP FOREIGN KEY `BookingSeat_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `bookingseat` DROP FOREIGN KEY `BookingSeat_seatId_fkey`;

-- DropForeignKey
ALTER TABLE `seat` DROP FOREIGN KEY `Seat_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `showtime` DROP FOREIGN KEY `Showtime_movieId_fkey`;

-- DropForeignKey
ALTER TABLE `showtime` DROP FOREIGN KEY `Showtime_roomId_fkey`;

-- AddForeignKey
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_showtimeId_fkey` FOREIGN KEY (`showtimeId`) REFERENCES `Showtime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingSeat` ADD CONSTRAINT `BookingSeat_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingSeat` ADD CONSTRAINT `BookingSeat_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
