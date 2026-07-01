import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { SUCCESS_MESSAGES } from '../common/constants/success-messages.constant';
import { CONFIG_DEFAULTS } from '../common/constants/config.constant';

// Removed formatMovieType and parseMovieType as we now use dynamic roomtype_id

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const movies = await this.prisma.movie.findMany({
      orderBy: { id: 'desc' },
      include: { moviegenre: { include: { genre: true } }, roomtype: true },
    });

    let ageLimits: any[] = [];
    try {
      ageLimits = await (this.prisma as any).ageLimit.findMany();
    } catch (e) { }

    return movies.map((m) => {
      const limit = ageLimits.find((a) => a.code === m.age_limit);
      return {
        id: m.id,
        title: m.title,
        description: m.descriptions,
        duration: m.duration,
        genre: m.moviegenre.map((mg) => mg.genre.genre_name).join(', '),
        releaseDate: m.release_date,
        posterUrl: m.image,
        bannerUrl: m.banner || null,
        type: m.roomtype ? m.roomtype.name : '',
        roomtype_id: m.roomtype_id,
        trailer: m.trailer,
        author: m.author,
        actors: m.actors,
        ageLimit: m.age_limit || 'P',
        ageLimitDescription: limit ? limit.description : (m.age_limit === 'P' ? CONFIG_DEFAULTS.MOVIE_AGE_LIMIT.P : m.age_limit === 'K' ? CONFIG_DEFAULTS.MOVIE_AGE_LIMIT.K : CONFIG_DEFAULTS.MOVIE_AGE_LIMIT.DYNAMIC(m.age_limit?.replace('T', '') || '18'))
      };
    });
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        moviegenre: { include: { genre: true } },
        roomtype: true,
      },
    });

    if (!movie) {
      throw new NotFoundException(ERROR_MESSAGES.MOVIE.NOT_FOUND);
    }

    let ageLimitDescription = '';
    try {
      const limit = await (this.prisma as any).ageLimit.findUnique({ where: { code: movie.age_limit } });
      if (limit) ageLimitDescription = limit.description;
    } catch (e) { }

    if (!ageLimitDescription) {
      ageLimitDescription = movie.age_limit === 'P' ? CONFIG_DEFAULTS.MOVIE_AGE_LIMIT.P : movie.age_limit === 'K' ? CONFIG_DEFAULTS.MOVIE_AGE_LIMIT.K : CONFIG_DEFAULTS.MOVIE_AGE_LIMIT.DYNAMIC(movie.age_limit?.replace('T', '') || '18');
    }

    return {
      id: movie.id,
      title: movie.title,
      description: movie.descriptions,
      duration: movie.duration,
      genre: movie.moviegenre.map((mg: any) => mg.genre.genre_name).join(', '),
      releaseDate: movie.release_date,
      posterUrl: movie.image,
      bannerUrl: movie.banner || null,
      type: movie.roomtype ? movie.roomtype.name : '',
      roomtype_id: movie.roomtype_id,
      trailer: movie.trailer,
      author: movie.author,
      actors: movie.actors,
      ageLimit: movie.age_limit || 'P',
      ageLimitDescription
    };
  }

  async create(data: any) {
    const {
      title,
      description,
      duration,
      genre,
      releaseDate,
      posterUrl,
      bannerUrl,
      roomtype_id,
      trailer,
      author,
      actors,
      ageLimit,
      schedules,
    } = data;

    const newMovie = await this.prisma.movie.create({
      data: {
        title,
        descriptions: description,
        duration: parseInt(duration),
        release_date: new Date(releaseDate),
        image: posterUrl,
        banner: bannerUrl,
        roomtype_id: roomtype_id ? parseInt(roomtype_id) : undefined,
        trailer: trailer,
        author: author,
        actors: actors,
        age_limit: ageLimit,
      },
    });

    if (genre) {
      let dbGenre = await this.prisma.genre.findFirst({
        where: { genre_name: genre },
      });
      if (!dbGenre) {
        dbGenre = await this.prisma.genre.create({ data: { genre_name: genre } });
      }
      await this.prisma.moviegenre.create({
        data: { movie_id: newMovie.id, genre_id: dbGenre.id },
      });
    }

    return newMovie;
  }

  async update(id: number, data: any) {
    console.log("UPDATE MOVIE REQUEST:", { id, data });
    const {
      title,
      description,
      duration,
      releaseDate,
      posterUrl,
      bannerUrl,
      roomtype_id,
      trailer,
      author,
      actors,
      ageLimit,
      schedules,
      genre,
    } = data;

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.descriptions = description;
    if (duration) dataToUpdate.duration = parseInt(duration);
    if (releaseDate) dataToUpdate.release_date = new Date(releaseDate);
    if (posterUrl !== undefined) dataToUpdate.image = posterUrl;
    if (bannerUrl !== undefined) dataToUpdate.banner = bannerUrl;
    if (roomtype_id !== undefined) dataToUpdate.roomtype_id = roomtype_id ? parseInt(roomtype_id) : null;
    if (trailer !== undefined) dataToUpdate.trailer = trailer;
    if (author !== undefined) dataToUpdate.author = author;
    if (actors !== undefined) dataToUpdate.actors = actors;
    if (ageLimit !== undefined) dataToUpdate.age_limit = ageLimit;

    const updatedMovie = await this.prisma.movie.update({
      where: { id },
      data: dataToUpdate,
    });

    if (genre) {
      let dbGenre = await this.prisma.genre.findFirst({
        where: { genre_name: genre },
      });
      if (!dbGenre) {
        dbGenre = await this.prisma.genre.create({ data: { genre_name: genre } });
      }

      await this.prisma.moviegenre.deleteMany({ where: { movie_id: id } });
      await this.prisma.moviegenre.create({
        data: { movie_id: id, genre_id: dbGenre.id },
      });
    }

    return updatedMovie;
  }

  async remove(id: number) {
    const futureShowtimes = await this.prisma.showtime.count({
      where: {
        movie_id: id,
        start_time: { gt: new Date() },
      },
    });

    if (futureShowtimes > 0) {
      throw new BadRequestException(ERROR_MESSAGES.MOVIE.CANNOT_DELETE_HAS_SHOWTIMES);
    }

    await this.prisma.movie.delete({
      where: { id },
    });
    return { message: SUCCESS_MESSAGES.MOVIE.DELETED };
  }
}
