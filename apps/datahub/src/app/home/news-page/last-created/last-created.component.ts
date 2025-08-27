import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { RouterFacade } from '@geonetwork-ui/feature/router'
import {
  FeatureSearchModule,
  FIELDS_BRIEF,
  SearchFacade,
} from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'

@Component({
  selector: 'datahub-last-created',
  templateUrl: './last-created.component.html',
  styleUrls: ['./last-created.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FeatureSearchModule],
  standalone: true,
})
export class LastCreatedComponent implements OnInit {
  constructor(
    private searchFacade: SearchFacade,
    private routerFacade: RouterFacade
  ) {}

  ngOnInit() {
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
    // console.log('resultsLayout', this.searchFacade);
    
    
  }

  onMetadataSelection(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }
}
