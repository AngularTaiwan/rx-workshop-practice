import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCheckboxChange } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { tap, takeUntil, map } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  registerForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    subscription: new FormGroup({
      checkboxAll: new FormControl(),
      subscribeRxWorkshop: new FormControl(true),
      subscribeAngularMaterial: new FormControl(true),
      subscribeAngularTutorial: new FormControl(true),
      subscribeAngularMaster: new FormControl(false)
    }),
    city: new FormControl(),
    area: new FormControl()
  });
  destroy$ = new Subject();

  regions$: Observable<any> = this.httpClient.get<any>('/assets/region.json');

  newsletterList = [
    { id: 'subscribeRxWorkshop', name: 'Rx Workshop' },
    { id: 'subscribeAngularMaterial', name: 'Angular Material完全攻略' },
    { id: 'subscribeAngularTutorial', name: 'Angular入門速成班' },
    { id: 'subscribeAngularMaster', name: 'Angular大師養成班' }
  ];

  indeterminateSubscription: boolean = false;

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }
  ngOnInit() {
    this.registerForm.get('subscription.checkboxAll').valueChanges.pipe(
      tap(value => {
        this.newsletterList.forEach(newsletter => {
          this.registerForm.get(`subscription.${newsletter.id}`).setValue(value);
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.registerForm.get('subscription').valueChanges.pipe(
      map(values => Object.keys(values)),
      map(arKeys => arKeys.filter(key => key !== 'checkboxAll')),
      map(keys => {
        return keys.reduce((subscriptionCount: number, contorlKey: string) => {
          subscriptionCount += (this.registerForm.get('subscription') as FormGroup).controls[contorlKey].value ? 1 : 0;
          return subscriptionCount;
        }, 0);
      }),
      tap(subscriptionCount => {
        let checked = false;
        this.indeterminateSubscription = subscriptionCount !== 0 && subscriptionCount !== this.newsletterList.length;
        if (subscriptionCount === this.newsletterList.length) {
          checked = true;
        }
        this.registerForm.get('subscription.checkboxAll').patchValue(checked, { emitEvent: false });
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.registerForm.reset({
      subscription: {
        subscribeRxWorkshop: true
      }
    });
  }

  // get indeterminateSubscription() {
  //   const subscriptionCount = this._getSubscriptionCount();
  //   return subscriptionCount !== 0 && subscriptionCount !== this.newsletterList.length;
  // }

  // private _getSubscriptionCount() {
  //   const subscriptionControls = (this.registerForm.get('subscription') as FormGroup).controls;

  //   return Object.keys(subscriptionControls)
  //     .filter(key => key !== 'checkboxAll').reduce((subscriptionCount: number, contorlKey: string) => {
  //       subscriptionCount += subscriptionControls[contorlKey].value ? 1 : 0;
  //       return subscriptionCount;
  //     }, 0);
  // }

  // subscribeAllChange($event: MatCheckboxChange) {
  //   this.newsletterList.forEach(newsletter => {
  //     this.registerForm.get(`subscription.${newsletter.id}`).setValue($event.checked);
  //   });
  // }

  submit() {
    console.log(this.registerForm.value);
  }

  constructor(private httpClient: HttpClient) {
  }

}
