const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Dọn dẹp dữ liệu cũ (nếu có)
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  // 1. Tạo Movies
  const movie1 = await prisma.movie.create({
    data: {
      title: 'CƯỜI XUYÊN BIÊN GIỚI - T13',
      description: 'Phim hài hước vui nhộn về chuyến phiêu lưu xuyên biên giới.',
      duration: 110,
      genre: 'Hài, Tình cảm',
      releaseDate: new Date('2024-11-01T00:00:00Z'),
      posterUrl: 'https://placehold.co/300x450/333/FFF?text=Cuoi+Xuyen+Bien+Gioi',
      status: 'showing'
    }
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'MẬT MÃ ĐỎ - K - Phụ đề',
      description: 'Phim hành động kịch tính với nhiều pha rượt đuổi ngoạn mục.',
      duration: 120,
      genre: 'Hành động',
      releaseDate: new Date('2024-11-15T00:00:00Z'),
      posterUrl: 'https://placehold.co/300x450/444/FFF?text=Mat+Ma+Do',
      status: 'showing'
    }
  });

  const movie3 = await prisma.movie.create({
    data: {
      title: 'NGÀY TA ĐÃ YÊU',
      description: 'Phim tình cảm nhẹ nhàng lãng mạn.',
      duration: 90,
      genre: 'Tình cảm',
      releaseDate: new Date('2024-12-12T00:00:00Z'),
      posterUrl: 'https://placehold.co/300x450/222/FFF?text=Ngay+Ta+Da+Yeu',
      status: 'coming_soon'
    }
  });

  // 2. Tạo Phòng chiếu
  const room1 = await prisma.room.create({
    data: {
      name: 'Phòng 1',
      capacity: 100
    }
  });

  // 3. Tạo Lịch chiếu (Showtimes)
  await prisma.showtime.create({
    data: {
      movieId: movie1.id,
      roomId: room1.id,
      startTime: new Date('2024-12-01T10:00:00Z'),
      endTime: new Date('2024-12-01T11:50:00Z'),
      price: 80000
    }
  });

  await prisma.showtime.create({
    data: {
      movieId: movie1.id,
      roomId: room1.id,
      startTime: new Date('2024-12-01T20:15:00Z'),
      endTime: new Date('2024-12-01T22:05:00Z'),
      price: 90000
    }
  });

  await prisma.showtime.create({
    data: {
      movieId: movie2.id,
      roomId: room1.id,
      startTime: new Date('2024-12-02T19:00:00Z'),
      endTime: new Date('2024-12-02T21:00:00Z'),
      price: 85000
    }
  });

  // 4. Tạo User Demo
  await prisma.user.create({
    data: {
      fullName: 'Khách hàng Demo',
      email: 'demo@ncc.vn',
      phone: '0987654321',
      password: 'password123', // Demo chỉ lưu text thường, thực tế sẽ mã hóa bcrypt
      role: 'user'
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    console.error("Exit 1");
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
