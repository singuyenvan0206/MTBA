import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const movies = await this.prisma.movie.findMany({
      orderBy: { id: 'desc' },
      include: { moviegenre: { include: { genre: true } } },
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
        type: m.type,
        trailer: m.trailer,
        author: m.author,
        actors: m.actors,
        ageLimit: m.age_limit || 'P',
        ageLimitDescription: limit ? limit.description : (m.age_limit === 'P' ? 'PHIM DÀNH CHO MỌI LỨA TUỔI' : m.age_limit === 'K' ? 'DƯỚI 13 TUỔI XEM CÙNG CHA MẸ' : `PHIM DÀNH CHO KHÁN GIẢ TỪ ${m.age_limit?.replace('T', '') || '18'} TUỔI TRỞ LÊN`)
      };
    });
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        moviegenre: { include: { genre: true } },
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    let ageLimitDescription = '';
    try {
      const limit = await (this.prisma as any).ageLimit.findUnique({ where: { code: movie.age_limit } });
      if (limit) ageLimitDescription = limit.description;
    } catch (e) { }

    if (!ageLimitDescription) {
      ageLimitDescription = movie.age_limit === 'P' ? 'PHIM DÀNH CHO MỌI LỨA TUỔI' : movie.age_limit === 'K' ? 'DƯỚI 13 TUỔI XEM CÙNG CHA MẸ' : `PHIM DÀNH CHO KHÁN GIẢ TỪ ${movie.age_limit?.replace('T', '') || '18'} TUỔI TRỞ LÊN`;
    }

    return {
      id: movie.id,
      title: movie.title,
      description: movie.descriptions,
      duration: movie.duration,
      genre: movie.moviegenre.map((mg: any) => mg.genre.genre_name).join(', '),
      releaseDate: movie.release_date,
      posterUrl: movie.image,
      type: movie.type,
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
      type,
      trailer,
      author,
      actors,
      ageLimit,
      schedules,
    } = data;

    const newMovie = await this.prisma.movie.create({
      data: {
        title,
        descriptions: description || '',
        duration: parseInt(duration),
        release_date: new Date(releaseDate),
        image: posterUrl,
        type: type || 'TYPE_2D',
        trailer: trailer || '',
        author: author || '',
        actors: actors || '',
        age_limit: ageLimit || 'P',
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
    const {
      title,
      description,
      duration,
      releaseDate,
      posterUrl,
      type,
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
    if (type) dataToUpdate.type = type;
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
    await this.prisma.movie.delete({
      where: { id },
    });
    return { message: 'Deleted successfully' };
  }
}
