import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PotionService {

  constructor(private http: HttpClient) { }

  public list(): Observable<any> {
    return this.http.get("assets/potions.json");
  }
}
