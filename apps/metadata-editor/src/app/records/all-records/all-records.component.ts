import { CommonModule } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import { SearchFacade, SearchService } from '@geonetwork-ui/feature/search'
import { TranslateDirective } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { RecordsCountComponent } from '../records-count/records-count.component'
import { Observable, Subscription } from 'rxjs'
import { ButtonComponent } from '@geonetwork-ui/ui/inputs'
import { CdkOverlayOrigin, Overlay, OverlayRef } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import { EditorFacade, ImportRecordComponent } from '@geonetwork-ui/feature/editor'
import { RecordsListComponent } from '../records-list.component'
import { map, take } from 'rxjs/operators'
import { SearchFiltersComponent } from '../../dashboard/search-filters/search-filters.component'
import {
  NgIconComponent,
  provideIcons,
  provideNgIconsConfig,
} from '@ng-icons/core'
import {
  iconoirNavArrowDown,
  iconoirNavArrowUp,
  iconoirPagePlus,
} from '@ng-icons/iconoir'
import { RedmineService } from '../../redmine.service'
import { DatasetRecord } from '@geonetwork-ui/common/domain/model/record'

@Component({
  selector: 'md-editor-all-records',
  templateUrl: './all-records.component.html',
  styleUrls: ['./all-records.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateDirective,
    RecordsCountComponent,
    ImportRecordComponent,
    CdkOverlayOrigin,
    RecordsListComponent,
    SearchFiltersComponent,
    NgIconComponent,
    ButtonComponent,
  ],
  providers: [
    provideIcons({
      iconoirNavArrowDown,
      iconoirNavArrowUp,
      iconoirPagePlus,
    }),
    provideNgIconsConfig({
      size: '1.5rem',
    }),
  ],
})
export class AllRecordsComponent implements OnInit, OnDestroy {
  @ViewChild('importRecordButton', { read: ElementRef })
  importRecordButton!: ElementRef
  @ViewChild('template') template!: TemplateRef<any>
  private overlayRef!: OverlayRef
  searchFields = ['user', 'changeDate']
  searchText$: Observable<string | null>
  subscription: Subscription

  isImportMenuOpen = false

  constructor(
    private router: Router,
    public searchFacade: SearchFacade,
    public searchService: SearchService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef,
    private redmineService: RedmineService,
    private editorFacade: EditorFacade
  ) {}

  ngOnInit() {
    this.subscription = this.searchFacade.searchFilters$
      .pipe(
        map((filters) => {
          if ('owner' in filters) {
            const { owner, ...rest } = filters
            return rest
          }
          return filters
        }),
        take(1)
      )
      .subscribe((filters) => {
        this.searchService.setFilters(filters)
      })
    this.searchText$ = this.searchFacade.searchFilters$.pipe(
      map((filters) => ('any' in filters ? (filters['any'] as string) : null))
    )
  }

  ngOnDestroy() {
    this.searchFacade.updateFilters({ any: '' })
    this.subscription.unsubscribe()
  }

  createRecord() {
    this.router.navigate(['/create']).catch((err) => console.error(err))
  }

  duplicateExternalRecord() {
    this.isImportMenuOpen = true

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.importRecordButton)
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ])

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    })

    const portal = new TemplatePortal(this.template, this.viewContainerRef)

    this.overlayRef.attach(portal)

    this.overlayRef.backdropClick().subscribe(() => {
      this.closeImportMenu()
    })
  }

  closeImportMenu() {
    if (this.overlayRef) {
      this.isImportMenuOpen = false
      this.overlayRef.dispose()
      this.cdr.markForCheck()
    }
  }

  importDataRedmine() {
    this.redmineService.getIssueData().subscribe((data: any) => {
      if (data.issue) {
        console.log('DATA ISSUEEEE: ',data.issue);
        // const transformedIssue = this.mapIssueToDatasetRecord(data.issue);
        // this.editorFacade.prefillRecordData(transformedIssue);
        // // console.log('Données assignées à prefillRecordData');
        // this.router.navigate(['/create']).catch((err) => console.error(err));
        // console.log("vita vvvvv");
        
      }
    });
    
  }

  private mapIssueToDatasetRecord(issue: any): DatasetRecord {
    const keywordsField = issue.custom_fields.find((field: any) => field.name === "Mots clés");
    const keywordsValue = keywordsField && keywordsField.value ?  keywordsField.value : '';

    return {
      title: issue.subject || 'Titre par défaut',
      uniqueIdentifier: `my-dataset-record-${issue.id}`,
      ownerOrganization: {
        name: issue.author.name || 'MyOrganization',
        translations: {}
      },
      contactsForResource: [],
      contacts: [
        {
          email: 'bob@org.net',
          role: 'author',
          organization: {
            name: issue.author.name || 'MyOrganization',
            translations: {}
          },
          firstName: 'Bob',
          lastName: 'TheGreat',
          position: 'developer',
        }
      ],
      kind: 'dataset',
      topics: ['testData'],
      keywords: [
        {
          thesaurus: { id: 'geonetwork.thesaurus.local' },
          type: 'other',
          label: keywordsValue,
        },
        {
          thesaurus: { id: 'geonetwork.thesaurus.local' },
          type: 'other',
          label: 'test',
        },
        {
          thesaurus: { id: 'geonetwork.thesaurus.local' },
          type: 'other',
          label: '_another_keyword_',
        },
      ],
      licenses: [],
      legalConstraints: [],
      securityConstraints: [],
      otherConstraints: [],
      overviews: [],
      status: 'ongoing', // issue.status.name
      recordCreated: issue.created_on,
      recordUpdated: issue.updated_on,
      resourceCreated: issue.created_on,
      resourceUpdated: issue.updated_on,
      abstract: issue.description || 'Abstract non fournie',
      lineage: 'This record was added from redmine hdf',
      spatialRepresentation: 'grid',
      otherLanguages: [],
      defaultLanguage: 'en',
      onlineResources: [
        {
          type: 'download',
          url: new URL(
            'http://geo.compiegnois.fr/documents/metiers/urba/docurba/60036_PLU_20220329.zip'
          ),
          name: 'Télécharger les données géographiques et les pièces écrites disponibles', // name or desc?
          description: 'Téléchargement du fichier',
          mimeType: 'x-gis/x-shapefile',
        },
        {
          type: 'service',
          url: new URL('https://my-org.net/ogc'),
          accessServiceProtocol: 'ogcFeatures',
          name: 'ogcFeaturesSecondRecord',
          description: 'This OGC service is the second part of the download',
          identifierInService: 'my:featuretype',
        },
      ],
      spatialExtents: [],
      temporalExtents: [],
      translations: {},
    };
  }


}
