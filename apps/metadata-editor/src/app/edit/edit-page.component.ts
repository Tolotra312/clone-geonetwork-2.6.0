import { CommonModule } from '@angular/common'
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ActivatedRoute, Router } from '@angular/router'
import { marker } from '@biesbjerg/ngx-translate-extract-marker'
import { PublicationVersionError } from '@geonetwork-ui/common/domain/model/error'
import {
  EditorFacade,
  MultilingualPanelComponent,
  RecordFormComponent,
} from '@geonetwork-ui/feature/editor'
import {
  NotificationsContainerComponent,
  NotificationsService,
} from '@geonetwork-ui/feature/notifications'
import { ButtonComponent } from '@geonetwork-ui/ui/inputs'
import {
  TranslateDirective,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core'
import { combineLatest, filter, firstValueFrom, Subscription, take } from 'rxjs'
import { map, skip } from 'rxjs/operators'
import { SidebarComponent } from '../dashboard/sidebar/sidebar.component'
import { PageSelectorComponent } from './components/page-selector/page-selector.component'
import { TopToolbarComponent } from './components/top-toolbar/top-toolbar.component'
import { SpinningLoaderComponent } from '@geonetwork-ui/ui/widgets'
import { SearchHeaderComponent } from '../dashboard/search-header/search-header.component'
import { PageErrorComponent } from './components/page-error/page-error.component'
import { DateService } from '@geonetwork-ui/util/shared'
import { log } from 'util'
import { RedmineService } from '../redmine.service'
import { FormsModule } from '@angular/forms';
import { CatalogRecord, Keyword } from '@geonetwork-ui/common/domain/model/record'

marker('editor.record.form.bottomButtons.comeBackLater')
marker('editor.record.form.bottomButtons.previous')
marker('editor.record.form.bottomButtons.next')

@Component({
  selector: 'md-editor-edit',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css'],
  standalone: true,
  imports: [
    RecordFormComponent,
    CommonModule,
    ButtonComponent,
    MatProgressSpinnerModule,
    TopToolbarComponent,
    NotificationsContainerComponent,
    PageSelectorComponent,
    TranslateDirective,
    TranslatePipe,
    SidebarComponent,
    SpinningLoaderComponent,
    SearchHeaderComponent,
    PageErrorComponent,
    MultilingualPanelComponent,
    FormsModule,
  ],
})
export class EditPageComponent implements OnInit, OnDestroy {
  subscription = new Subscription()

  currentPage$ = this.facade.currentPage$
  pagesLength$ = this.facade.editorConfig$.pipe(
    map((config) => config.pages.length)
  )
  isLastPage$ = combineLatest([this.currentPage$, this.pagesLength$]).pipe(
    map(([currentPage, pagesCount]) => currentPage >= pagesCount - 1)
  )
  hasRecordChanged$ = this.facade.hasRecordChanged$.pipe(skip(1))

  newRecord = false
  isLoading = true
  translatePanelOpen = false
  cardNumber = ''

  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement>

  constructor(
    private route: ActivatedRoute,
    protected facade: EditorFacade,
    private notificationsService: NotificationsService,
    private translateService: TranslateService,
    private router: Router,
    private dateService: DateService,
    private redmineService: RedmineService,
  ) {}

  ngOnInit(): void {
    const [currentRecord, currentRecordSource] =
      this.route.snapshot.data['record']

    this.facade.openRecord(currentRecord, currentRecordSource)
    console.log('EditPageComponent initialized with record:', currentRecord);
    // console.log('EditPageComponent initialized with record source:', currentRecordSource);
    console.log('EditPageComponent initialized with route data:', this.route.snapshot.data);
    console.log('EditPageComponent initialized with route routeConfig:', this.route.snapshot.routeConfig);
    
    this.subscription.add(
      this.facade.editorConfig$.subscribe(config => {
        console.log('Champs définis dans editorConfig$ : ', config);
        // console.table(config.fields.map(f => f.name)); // liste tous les noms de champs
      })
    );

    this.subscription.add(
      this.facade.record$.pipe(take(1)).subscribe((record) => {
        console.log('EditPageComponent record:', record);
        
        if (!record.uniqueIdentifier) {
          this.newRecord = true
          this.facade.saveRecord()
        } else {
          this.isLoading = false
        }
      })
    )

    // if (this.route.snapshot.routeConfig?.path.includes('create')) {
    //   this.facade.record$.pipe(take(1)).subscribe((record) => {
    //     // console.log('Record mis à jour :', record);
    //     if (record === null){
    //       this.facade.openRecord(
    //         currentRecord,
    //         currentRecordSource
    //       )
    //     }else{
    //       this.facade.openRecord(
    //         record, 
    //         null
    //       );
    //     }
        
    //   });
    // }else{
    //   // const [currentRecord, currentRecordSource, currentRecordAlreadySaved] = this.route.snapshot.data['record'] 
    //   this.facade.openRecord(
    //       currentRecord,
    //       currentRecordSource
    //   )
    // }

    this.subscription.add(
      this.facade.saveError$.subscribe((error) => {
        if (error instanceof PublicationVersionError) {
          this.notificationsService.showNotification(
            {
              type: 'error',
              title: this.translateService.instant(
                'editor.record.publishVersionError.title'
              ),
              text: this.translateService.instant(
                'editor.record.publishVersionError.body',
                { currentVersion: error.detectedApiVersion }
              ),
              closeMessage: this.translateService.instant(
                'editor.record.publishVersionError.closeMessage'
              ),
            },
            undefined,
            error
          )
        } else {
          this.notificationsService.showNotification(
            {
              type: 'error',
              title: this.translateService.instant(
                'editor.record.publishError.title'
              ),
              text: `${this.translateService.instant(
                'editor.record.publishError.body'
              )} ${error.message}`,
              closeMessage: this.translateService.instant(
                'editor.record.publishError.closeMessage'
              ),
            },
            undefined,
            error
          )
        }
      })
    )

    this.subscription.add(
      this.facade.saveSuccess$.subscribe(() => {
        if (!this.newRecord) {
          this.notificationsService.showNotification(
            {
              type: 'success',
              title: this.translateService.instant(
                'editor.record.publishSuccess.title'
              ),
              text: `${this.translateService.instant(
                'editor.record.publishSuccess.body'
              )}`,
            },
            2500
          )
        }
      })
    )

    this.subscription.add(
      this.facade.record$.subscribe((record) => {
        this.facade.checkHasRecordChanged(record)
      })
    )

    // if we're on the /duplicate route, go to /edit/{uuid} to update the uuid
    if (this.route.snapshot.routeConfig?.path.includes('duplicate')) {
      this.router.navigate(['edit', currentRecord.uniqueIdentifier], {
        replaceUrl: true,
      })
    }

    // if the record unique identifier changes, navigate to /edit/newUuid
    this.subscription.add(
      this.facade.record$
        .pipe(
          filter(
            (record) =>
              record?.uniqueIdentifier !== currentRecord.uniqueIdentifier
          ),
          take(1)
        )
        .subscribe((savedRecord) => {
          this.router.navigate(['edit', savedRecord.uniqueIdentifier], {
            replaceUrl: true,
          })
        })
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  async previousPageButtonHandler() {
    const currentPage = await firstValueFrom(this.currentPage$)
    if (currentPage === 0) {
      this.router.navigate(['catalog', 'search'])
    } else {
      this.facade.setCurrentPage(currentPage - 1)
      this.scrollToTop()
    }
  }

  async nextPageButtonHandler() {
    const currentPage = await firstValueFrom(this.currentPage$)
    const pagesCount = await firstValueFrom(this.pagesLength$)
    if (currentPage < pagesCount - 1) {
      this.facade.setCurrentPage(currentPage + 1)
      this.scrollToTop()
    }
  }

  private scrollToTop() {
    this.scrollContainer.nativeElement.scroll({
      behavior: 'instant',
      top: 0,
    })
  }

  formatDate(date: Date): string {
    return this.dateService.formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }

  fetchRedmineData() {
    // this.redmineService.loginToGeoNetwork();
    console.log('Fetching Redmine data for card number:', this.cardNumber);
    
    if (!this.cardNumber) return;

    this.redmineService.getIssueByCardNumber(this.cardNumber).subscribe((data: any) => {
      console.log('Redmine data fetched:', data);
      
      if (data.issues && data.issues.length > 0) {
        console.log('DATA ISSUEEEE: ',data.issues);
        const issue = data.issues[0];
        // console.log('First issue:', issue.subject);
        const keywordsField = issue.custom_fields.find(cf => cf.name === 'Mots clés')?.value;
        console.log('Mots clés:', keywordsField);
        console.log('statut: ',issue.status);
        console.log("statut name: ",issue.status.name);
        
        
        
        // console.log('language: ',this.translateService.getDefaultLang());
        
        // console.log('lang: ',this.translateService.currentLang);
        
        const keywordsValue = keywordsField ?  keywordsField : '';
        // const keywords: Keyword[] = [
        //   {
        //     thesaurus: { id: 'geonetwork.thesaurus.local' },
        //     type: 'other',
        //     label: keywordsValue,
        //   },
        //   {
        //     thesaurus: { id: 'geonetwork.thesaurus.local' },
        //     type: 'other',
        //     label: 'test',
        //   },
        //   {
        //     thesaurus: { id: 'geonetwork.thesaurus.local' },
        //     type: 'other',
        //     label: '_another_keyword_',
        //   },
        // ];

        const keywords: Keyword[] = keywordsField
          .split(',')
          .map((kw: string) => kw.trim())
          .filter((kw: string) => kw.length > 0)
          .map((kw: string): Keyword => ({
            thesaurus: { id: 'geonetwork.thesaurus.local' },
            type: 'other',
            label: kw,
          }));

        
        this.facade.record$.pipe(take(1)).subscribe(oldRecord => {
          // Création d’un nouveau record complet avec les données Redmine
          const updatedRecord: CatalogRecord = {
            ...oldRecord,
            title: issue.subject, 
            abstract: issue.description || 'Description par défaut', 
            overviews: [], 
            keywords: keywords, // type `Keyword[]`
            kind: 'dataset',
            resourceIdentifier: `redmine-issue-${issue.id}`,
            resourceCreated: issue.created_on,
            resourceUpdated: issue.updated_on,
            recordUpdated: issue.updated_on,
            licenses: [], 
            lineage: '', 
            contacts: [],
            contactsForResource: [],
            spatialExtents: [],
            temporalExtents: [],
            status: 'ongoing', 
            topics: [],
            legalConstraints: [],
            securityConstraints: [],
            otherConstraints: [],
            ownerOrganization: {
              name: issue.author.name || 'MyOrganization',
              translations: {}
            },
            defaultLanguage: 'fre',
            otherLanguages: [],
            uniqueIdentifier: oldRecord?.uniqueIdentifier ?? 'temp-id',
            onlineResources: [],
          };
  
          //  Réouverture complète du record avec les nouvelles données
          this.facade.openRecord(updatedRecord, null);
  
          // On remet la page sur la première
          this.facade.setCurrentPage(0);
        });
        
        // // this.facade.updateRecordField('abstract', issue.description || '');
        // // this.facade.updateRecordField('title', issue.subject);
        // this.facade.updateRecordField('title', { fre: issue.subject, eng: 'Translation of subject here', });
        // this.facade.setFieldVisibility({ model: 'title' }, true);

        // this.facade.updateRecordField('abstract', 'dataset blalbala');
        // this.facade.updateRecordField('overviews', 'overviews blalbala');

        // this.facade.updateRecordField('keywords', keywords);

        // this.facade.updateRecordField('kind', 'dataset');
      
        // // this.facade.updateRecordField('uniqueIdentifier', `redmine-issue-${issue.id}`);
        // this.facade.updateRecordField('resourceIdentifier', `redmine-issue-${issue.id}`);
        // this.facade.updateRecordField('resourceCreated', issue.created_on);
        // this.facade.updateRecordField('resourceUpdated', issue.updated_on);
        // this.facade.updateRecordField('recordUpdated', issue.updated_on);

        // this.facade.updateRecordField('licenses','Licence Ouverte (Etalab)');

        // this.facade.prefillRecordData(issue);

        // // this.facade.record$.pipe(take(1)).subscribe(record => {
        // //   this.facade.openRecord(record, null);
        // // });
        // // const transformedIssue = this.mapIssueToDatasetRecord(data.issue);
        // // this.editorFacade.prefillRecordData(transformedIssue);
        // // console.log('Données assignées à prefillRecordData');
        // // this.router.navigate(['/create']).catch((err) => console.error(err));
        // this.facade.setCurrentPage(0);
      }
      else {
        alert('Aucune donnée trouvée pour ce numéro de carte.');
        return;
      }
    });
    
  }

  

}
