import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeatureSearchModule, FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { Observable } from 'rxjs';
import { RouterFacade } from '@geonetwork-ui/feature/router';
import { getMetadataQualityConfig, MetadataQualityConfig } from '@geonetwork-ui/util/app-config'
import { SearchFiltersComponent } from '../search/search-filters/search-filters.component'

@Component({
  selector: 'datahub-maps-recent-page',
  standalone: true,
  imports: [CommonModule, SearchFiltersComponent, FeatureSearchModule],
  templateUrl: './maps-recent-page.component.html',
  styleUrl: './maps-recent-page.component.css',
})
export class MapsRecentPageComponent implements OnInit {
  records$: Observable<CatalogRecord[]>;
  metadataQualityDisplay: boolean
  constructor(
    private searchFacade: SearchFacade,
    private routerFacade: RouterFacade
  ) {}


  ngOnInit(): void {
    this.searchFacade
      .setConfigRequestFields([...FIELDS_BRIEF, 'dateStamp'])
      .setPageSize(10)
      .setSortBy(['desc', 'dateStamp'])
      .setResultsLayout('FEED')
    this.records$ = this.searchFacade.results$; 
    // console.log("records: ",this.records$ );
    const cfg: MetadataQualityConfig =
      getMetadataQualityConfig() || ({} as MetadataQualityConfig)
    this.metadataQualityDisplay = cfg.ENABLED
  }
  onMapClick(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }

  onMetadataSelection(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }
}
