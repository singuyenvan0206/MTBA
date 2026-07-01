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
      include: { moviegenre: { include: { genre: true } }, movieroomtype: { include: { roomtype: true } } },
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
        genres: m.moviegenre.map((mg) => mg.genre.genre_name),
        releaseDate: m.release_date,
        posterUrl: m.image,
        bannerUrl: m.banner || null,
        type: m.movieroomtype.map((mr) => mr.roomtype.name).join(', '),
        roomtype_ids: m.movieroomtype.map((mr) => mr.roomtype_id),
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
        movieroomtype: { include: { roomtype: true } },
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
      genres: movie.moviegenre.map((mg: any) => mg.genre.genre_name),
      releaseDate: movie.release_date,
      posterUrl: movie.image,
      bannerUrl: movie.banner || null,
      type: movie.movieroomtype.map((mr: any) => mr.roomtype.name).join(', '),
      roomtype_ids: movie.movieroomtype.map((mr: any) => mr.roomtype_id),
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
      genres,
      releaseDate,
      posterUrl,
      bannerUrl,
      roomtype_id,
      roomtype_ids, // array of ids
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
        trailer: trailer,
        author: author,
        actors: actors,
        age_limit: ageLimit,
      },
    });

    let genresArray: any[] = [];
    if (genres && Array.isArray(genres) && genres.length > 0) genresArray = genres;
    else if (genre) genresArray = [genre];

    for (const g of genresArray) {
      let dbGenre = await this.prisma.genre.findFirst({
        where: { genre_name: g },
      });
      if (!dbGenre) {
        dbGenre = await this.prisma.genre.create({ data: { genre_name: g } });
      }
      await this.prisma.moviegenre.create({
        data: { movie_id: newMovie.id, genre_id: dbGenre.id },
      });
    }

    let roomtypesArray: any[] = [];
    if (roomtype_ids && Array.isArray(roomtype_ids) && roomtype_ids.length > 0) roomtypesArray = roomtype_ids;
    else if (roomtype_id) roomtypesArray = [roomtype_id];

    if (roomtypesArray.length > 0) {
      for (const rtId of roomtypesArray) {
        await this.prisma.movieroomtype.create({
          data: { movie_id: newMovie.id, roomtype_id: parseInt(rtId) }
        });
      }
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
      roomtype_ids,
      trailer,
      author,
      actors,
      ageLimit,
      schedules,
      genres,
      genre,
    } = data;

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.descriptions = description;
    if (duration) dataToUpdate.duration = parseInt(duration);
    if (releaseDate) dataToUpdate.release_date = new Date(releaseDate);
    if (posterUrl !== undefined) dataToUpdate.image = posterUrl;
    if (bannerUrl !== undefined) dataToUpdate.banner = bannerUrl;
    if (trailer !== undefined) dataToUpdate.trailer = trailer;
    if (author !== undefined) dataToUpdate.author = author;
    if (actors !== undefined) dataToUpdate.actors = actors;
    if (ageLimit !== undefined) dataToUpdate.age_limit = ageLimit;

    const updatedMovie = await this.prisma.movie.update({
      where: { id },
      data: dataToUpdate,
    });

    let genresArray: any[] = [];
    if (genres && Array.isArray(genres) && genres.length > 0) genresArray = genres;
    else if (genre) genresArray = [genre];

    if (genresArray.length > 0) {
      await this.prisma.moviegenre.deleteMany({ where: { movie_id: id } });
      for (const g of genresArray) {
        let dbGenre = await this.prisma.genre.findFirst({
          where: { genre_name: g },
        });
        if (!dbGenre) {
          dbGenre = await this.prisma.genre.create({ data: { genre_name: g } });
        }
        await this.prisma.moviegenre.create({
          data: { movie_id: id, genre_id: dbGenre.id },
        });
      }
    }

    let roomtypesArray: any[] = [];
    if (roomtype_ids && Array.isArray(roomtype_ids) && roomtype_ids.length > 0) roomtypesArray = roomtype_ids;
    else if (roomtype_id) roomtypesArray = [roomtype_id];

    if (roomtypesArray.length > 0) {
      await this.prisma.movieroomtype.deleteMany({ where: { movie_id: id } });
      for (const rtId of roomtypesArray) {
        await this.prisma.movieroomtype.create({
          data: { movie_id: id, roomtype_id: parseInt(rtId) }
        });
      }
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
