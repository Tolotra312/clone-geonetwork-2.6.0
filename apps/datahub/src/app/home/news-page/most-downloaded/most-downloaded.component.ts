import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { Observable } from 'rxjs';
import { RouterFacade } from '@geonetwork-ui/feature/router';

@Component({
  selector: 'datahub-most-downloaded',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './most-downloaded.component.html',
  styleUrl: './most-downloaded.component.css',
})
export class MostDownloadedComponent implements OnInit {
  records$: Observable<CatalogRecord[]>;

  constructor(
    private searchFacade: SearchFacade,
    private routerFacade: RouterFacade
  ) { }

  ngOnInit(): void {
    // this.searchFacade
    //   .setConfigRequestFields([...FIELDS_BRIEF, 'createDate', 'changeDate'])
    //   .setPageSize(8)
    //   .setSortBy(['desc', 'dateStamp'])
    //   .setResultsLayout('FEED')
    //   .setConfigFilters({
    //     'th_otherKeywords-.default': {
    //       SPRC: true
    //     } 
    //   })
    this.searchFacade
      .setConfigRequestFields([...FIELDS_BRIEF, 'dateStamp'])
      .setPageSize(8)
      .setSortBy(['desc', 'dateStamp'])
      .setResultsLayout('FEED')
      .setConfigFilters({
        'th_otherKeywords-.default': {
          SPRC: true
        } 
      })
    this.records$ = this.searchFacade.results$;
    // console.log("records: ", this.records$);
  }

  onMapClick(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }

}
