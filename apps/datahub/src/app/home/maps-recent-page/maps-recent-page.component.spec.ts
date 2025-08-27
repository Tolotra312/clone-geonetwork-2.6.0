import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MapsRecentPageComponent } from './maps-recent-page.component'

describe('MapsRecentPageComponent', () => {
  let component: MapsRecentPageComponent
  let fixture: ComponentFixture<MapsRecentPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapsRecentPageComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(MapsRecentPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
