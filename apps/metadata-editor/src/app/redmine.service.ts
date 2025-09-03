import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environements/environement';

@Injectable({
  providedIn: 'root',
})
export class RedmineService {
  // private apiUrl = 'https://redmine.hautsdefrance.fr/issues/7085.json';
  private apiUrl = '/redmine-api/issues/7084.json';
  // private apiUrl = '/redmine-api/issues/';
  // private apiUrlByCardNumber = '/redmine-api/issues.json?cf_1=';
  private apiUrlByCardNumber = '/redmine-api/issues.json?status_id=7&cf_17=Oui-Externe|Oui-Interne&cf_1=';
  private username = environment.redmineUsername;
  private password = environment.redminePassword;

  constructor(private http: HttpClient) {}

  getIssueData() {
    const headers = new HttpHeaders({
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
        'Content-Type': 'application/json',
      });

    return this.http.get(this.apiUrl, { headers });
  }

  getIssueByCardNumber(cardNumber: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
      'Content-Type': 'application/json',
    });
    
    return this.http.get(`${this.apiUrlByCardNumber}${cardNumber}`, { headers });
  }

  

}
