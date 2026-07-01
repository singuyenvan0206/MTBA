import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimesService } from './showtimes.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

describe('ShowtimesService', () => {
  let service: ShowtimesService;
  let prisma: PrismaService;

  const mockPrisma = {
    showtime: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ShowtimesService>(ShowtimesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkOverlap', () => {
    it('should return found overlapping showtime', async () => {
      const mockShowtime = { id: 1, screen_id: 1, start_time: new Date(), end_time: new Date() };
      mockPrisma.showtime.findFirst.mockResolvedValue(mockShowtime);

      const result = await service.checkOverlap(1, '2026-07-01T08:00:00Z', '2026-07-01T10:00:00Z');
      expect(result).toEqual(mockShowtime);
      expect(mockPrisma.showtime.findFirst).toHaveBeenCalledWith({
        where: {
          screen_id: 1,
          start_time: { lt: new Date('2026-07-01T10:00:00Z') },
          end_time: { gt: new Date('2026-07-01T08:00:00Z') },
          id: undefined,
        },
      });
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if showtime overlaps', async () => {
      mockPrisma.showtime.findFirst.mockResolvedValue({ id: 99 });

      const data = {
        movie_id: 1,
        screen_id: 1,
        start_time: '2026-07-01T08:00:00Z',
        end_time: '2026-07-01T10:00:00Z',
      };

      await expect(service.create(data)).rejects.toThrow(
        new BadRequestException(ERROR_MESSAGES.SHOWTIME.OVERLAP),
      );
    });

    it('should create showtime if no overlap exists', async () => {
      mockPrisma.showtime.findFirst.mockResolvedValue(null);
      const mockCreated = { id: 2, movie_id: 1, screen_id: 1 };
      mockPrisma.showtime.create.mockResolvedValue(mockCreated);

      const data = {
        movie_id: 1,
        screen_id: 1,
        start_time: '2026-07-01T08:00:00Z',
        end_time: '2026-07-01T10:00:00Z',
      };

      const result = await service.create(data);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if update overlaps with another showtime', async () => {
      mockPrisma.showtime.findFirst.mockResolvedValue({ id: 99 });

      const data = {
        movie_id: 1,
        screen_id: 1,
        start_time: '2026-07-01T08:00:00Z',
        end_time: '2026-07-01T10:00:00Z',
      };

      await expect(service.update(1, data)).rejects.toThrow(
        new BadRequestException(ERROR_MESSAGES.SHOWTIME.OVERLAP),
      );
    });
  });
});
