import { SortByField } from './search.model'

export const SortByEnum: Record<string, SortByField> = {
  CREATE_DATE: ['desc', 'createDate'],
  CREATE_DATE_ASC: ['asc', 'createDate'],
  POPULARITY: ['desc', 'userSavedCount'],
  POPULARITY_ASC: ['asc', 'userSavedCount'],
  RELEVANCY: ['desc', '_score'],
  QUALITY_SCORE: ['desc', 'qualityScore'],
  CHANGE_DATE: ['desc', 'changeDate'],
}
