import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding theater, screens, and seats...');

    // Delete existing screens & seats
    await prisma.seat.deleteMany({});
    await prisma.screen.deleteMany({});
    await prisma.theater.deleteMany({});

    // Create a Theater
    const theater = await prisma.theater.create({
        data: {
            name: 'Rạp Trung Tâm',
            location: '87 Láng Hạ, Ba Đình, Hà Nội',
            phone: '02435141791'
        }
    });

    // Config cho 7 phòng với số lượng khoảng 100-150 ghế, và khối VIP chiếm 25-30% ở chính giữa
    const roomConfigs = [
        { r: 10, c: 10, vipR: [4, 7], vipC: [3, 8] },   // Room 1: 100 ghế (VIP: 4x6 = 24 ghế ~ 24%)
        { r: 10, c: 12, vipR: [4, 7], vipC: [3, 10] },  // Room 2: 120 ghế (VIP: 4x8 = 32 ghế ~ 26%)
        { r: 11, c: 12, vipR: [4, 8], vipC: [3, 10] },  // Room 3: 132 ghế (VIP: 5x8 = 40 ghế ~ 30%)
        { r: 10, c: 14, vipR: [4, 7], vipC: [3, 12] },  // Room 4: 140 ghế (VIP: 4x10= 40 ghế ~ 28%)
        { r: 11, c: 13, vipR: [4, 8], vipC: [4, 10] },  // Room 5: 143 ghế (VIP: 5x7 = 35 ghế ~ 24%)
        { r: 9,  c: 14, vipR: [3, 6], vipC: [4, 11] },  // Room 6: 126 ghế (VIP: 4x8 = 32 ghế ~ 25%)
        { r: 12, c: 12, vipR: [5, 9], vipC: [3, 10] },  // Room 7: 144 ghế (VIP: 5x8 = 40 ghế ~ 27%)
    ];

    // Create 7 Screens
    for (let i = 1; i <= 7; i++) {
        const config = roomConfigs[i-1];
        const rowsCount = config.r;
        const colsCount = config.c;
        const totalCapacity = rowsCount * colsCount;

        const screen = await prisma.screen.create({
            data: {
                name: `Phòng chiếu số ${i}`,
                seat_capacity: totalCapacity,
                theater_id: theater.id
            }
        });

        console.log(`Created Screen: ${screen.name} - Capacity: ${totalCapacity}`);

        const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const seatsData: any[] = [];

        for (let r = 0; r < rowsCount; r++) {
            const rowLabel = rowLetters[r];
            for (let c = 1; c <= colsCount; c++) {
                // Determine seat type
                let seatType: 'STANDARD' | 'VIP' | 'SWEETBOX' = 'STANDARD';
                
                // Last row -> Sweetbox
                if (r === rowsCount - 1) {
                    seatType = 'SWEETBOX';
                } else if (r >= config.vipR[0] - 1 && r <= config.vipR[1] - 1) { // -1 vì index mảng bắt đầu từ 0
                    // Căn VIP ở giữa
                    if (c >= config.vipC[0] && c <= config.vipC[1]) {
                        seatType = 'VIP';
                    }
                }

                seatsData.push({
                    screen_id: screen.id,
                    seat_number: `${rowLabel}${c}`,
                    is_booked: false,
                    type: seatType
                });
            }
        }

        // Bulk insert seats
        await prisma.seat.createMany({
            data: seatsData
        });
    }

    console.log('Seeding complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
