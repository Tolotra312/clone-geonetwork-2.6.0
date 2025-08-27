import { Component, OnInit } from '@angular/core'
import {
  FeatureSearchModule,
  FIELDS_BRIEF,
  SearchFacade,
} from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { RouterFacade } from '@geonetwork-ui/feature/router'
import { getMetadataQualityConfig, MetadataQualityConfig } from '@geonetwork-ui/util/app-config'
import { SearchFiltersComponent } from '../search/search-filters/search-filters.component'

@Component({
  selector: 'datahub-maps-page',
  standalone: true,
  imports: [FeatureSearchModule, SearchFiltersComponent],
  templateUrl: './maps-page.component.html',
  styleUrl: './maps-page.component.css',
})
export class MapsPageComponent implements OnInit {
  metadataQualityDisplay: boolean
  selectedRecords: CatalogRecord[] = [];
   constructor(
      private searchFacade: SearchFacade,
      private routerFacade: RouterFacade
    ) {}

  ngOnInit(): void {  
    // this.searchFacade
    //   .setConfigRequestFields([...FIELDS_BRIEF, 'dateStamp'])
    //   .setPageSize(3)
    //   .setSortBy(['desc', 'dateStamp'])
    //   .setResultsLayout('FEED')
    //   .setConfigFilters({
    //     'th_otherKeywords-.default': {
    //         CALU: true
    //     } 
    //   })

    this.searchFacade
      .setConfigRequestFields([...FIELDS_BRIEF, 'createDate', 'changeDate'])
      .setPageSize(3)
      .setSortBy(['desc', 'createDate'])
      .setResultsLayout('FEED')

    const cfg: MetadataQualityConfig =
      getMetadataQualityConfig() || ({} as MetadataQualityConfig)
    this.metadataQualityDisplay = cfg.ENABLED
      
  }

  onMetadataSelection(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }

  hasSelectedRecords(): boolean {
    return true;
  }

}
