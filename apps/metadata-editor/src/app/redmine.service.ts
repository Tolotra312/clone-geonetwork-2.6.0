import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../environements/environement'

@Injectable({
  providedIn: 'root',
})
export class RedmineService {
  // private apiUrl = 'https://redmine.hautsdefrance.fr/issues/7085.json';
  private apiUrl = '/redmine-api/issues/7084.json'
  // private apiUrl = '/redmine-api/issues/';
  // private apiUrlByCardNumber = '/redmine-api/issues.json?cf_1=';
  private apiUrlByCardNumber = '/redmine-api/issues.json?cf_1='
  private username = environment.redmineUsername
  private password = environment.redminePassword

  constructor(private http: HttpClient) {}

  getIssueData() {
    // const encodedCredentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    // const headers = new HttpHeaders({
    //     'Authorization': `Basic ${encodedCredentials}`,
    //     'Content-Type': 'application/json',
    // });

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`),
      'Content-Type': 'application/json',
    })

    return this.http.get(this.apiUrl, { headers })
  }

  getIssueByCardNumber(cardNumber: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`),
      'Content-Type': 'application/json',
    })
    // const apiUrl = `https://redmine.hautsdefrance.fr/issues.json?cf_1=${this.cardNumber}`;
    return this.http.get(`${this.apiUrlByCardNumber}${cardNumber}`, { headers })
  }

  loginToGeoNetwork() {
    const params = new HttpParams()
      .set('username', 'metourneau')
      .set('password', 'oBlV@I2b#0E$5l')

    this.http
      .post('/geonetwork/srv/eng/xml.user.login', params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        responseType: 'text', // GeoNetwork renvoie du XML
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Connexion GeoNetwork réussie')
        },
        error: (error) => {
          console.error('❌ Erreur de login GeoNetwork', error)
        },
      })
  }
}
