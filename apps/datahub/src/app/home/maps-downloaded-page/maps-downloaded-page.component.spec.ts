import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MapsDownloadedPageComponent } from './maps-downloaded-page.component'

describe('MapsDownloadedPageComponent', () => {
  let component: MapsDownloadedPageComponent
  let fixture: ComponentFixture<MapsDownloadedPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapsDownloadedPageComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(MapsDownloadedPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
