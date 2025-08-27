import { ChangeDetectionStrategy, Component } from '@angular/core'
import { getGlobalConfig } from '@geonetwork-ui/util/app-config'
import { KeyFiguresComponent } from './key-figures/key-figures.component'
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core'
import { FeatureSearchModule } from '@geonetwork-ui/feature/search'
import { CommonModule } from '@angular/common'
import { LastCreatedComponent } from './last-created/last-created.component'
import { MostRecentComponent } from './most-recent/most-recent.component'
import { MostDownloadedComponent } from './most-downloaded/most-downloaded.component'
import { Router } from '@angular/router';

@Component({
  selector: 'datahub-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    KeyFiguresComponent,
    TranslatePipe,
    TranslateDirective,
    FeatureSearchModule,
    LastCreatedComponent,
    MostRecentComponent,
    MostDownloadedComponent
  ],
})
export class NewsPageComponent {
  constructor(private router: Router) {}
  getContactMail(): string {
    return getGlobalConfig().CONTACT_EMAIL
  }

  onMostRecentClick():void{
    this.router.navigate(['/maps-recent']);
  }

  onMapsClick():void{
    this.router.navigate(['/maps']);
  }

  onMostDownloadedClick():void{
    this.router.navigate(['/maps-downloaded']);
  }
}
