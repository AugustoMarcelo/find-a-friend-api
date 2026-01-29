import { WatchedList } from '@/core/entities/watched-list'
import { Photo } from './photo'

export class PetPhotos extends WatchedList<Photo> {
  compareItems(a: Photo, b: Photo): boolean {
    return a.id.equals(b.id)
  }
}
