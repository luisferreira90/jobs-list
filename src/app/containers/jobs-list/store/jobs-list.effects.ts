import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, filter, map } from 'rxjs/operators';
import {
  deleteJobAd,
  deleteJobAdSuccess,
  getJobsList,
  getJobsListError,
  getJobsListSuccess,
  updateJobAdStatus,
  updateJobAdStatusError,
  updateJobAdStatusSuccess,
} from './jobs-list.actions';
import { of } from 'rxjs';
import { ApiService } from '../../../shared/services/api/api.service';
import { createInvoice } from '../../invoices-list/store/invoices-list.actions';
import { selectJobsListParams } from './jobs-list.selectors';
import { Store } from '@ngrx/store';
import { JobsListState } from './jobs-list.reducer';
import { NotificationsService } from '../../../shared/services/notifications/notifications.service';
import { JobAd } from '../../../models/models';

@Injectable()
export class JobsListEffects {
  loadJobsList$ = createEffect(() =>
    this._actions$.pipe(
      ofType(getJobsList),
      exhaustMap((action) =>
        this._apiService.getJobsList(action.params).pipe(
          map((jobsList) => getJobsListSuccess({ jobsListResponse: jobsList })),
          catchError((error) => of(getJobsListError({ errorMessage: error }))),
        ),
      ),
    ),
  );

  deleteJobAd$ = createEffect(() =>
    this._actions$.pipe(
      ofType(deleteJobAd),
      exhaustMap((action) =>
        this._apiService
          .deleteJobAd(action.jobAd.id)
          .pipe(map(() => deleteJobAdSuccess({ jobAd: action.jobAd }))),
      ),
    ),
  );

  onDeleteJobAdSuccess$ = createEffect(() =>
    this._actions$.pipe(
      ofType(deleteJobAdSuccess),
      map((response) => {
        this.notificationHandler(response.jobAd, 'deleted');
        return response;
      }),
      concatLatestFrom(() => this._store.select(selectJobsListParams)),
      map(([action, jobsListParams]) => getJobsList({ params: jobsListParams })),
    ),
  );

  updateJobAdStatus$ = createEffect(() =>
    this._actions$.pipe(
      ofType(updateJobAdStatus),
      exhaustMap((action) =>
        this._apiService.updateJob(action.jobAd).pipe(
          map((jobAd) => updateJobAdStatusSuccess({ jobAd })),
          catchError((error) => of(updateJobAdStatusError({ errorMessage: error }))),
        ),
      ),
    ),
  );

  onUpdateJobAdSuccess$ = createEffect(() =>
    this._actions$.pipe(
      ofType(updateJobAdStatusSuccess),
      map((response) => {
        this.notificationHandler(response.jobAd, 'status updated');
        return response;
      }),
      concatLatestFrom(() => this._store.select(selectJobsListParams)),
      map(([action, jobsListParams]) => getJobsList({ params: jobsListParams })),
    ),
  );

  createInvoiceIfJobAdPublished$ = createEffect(() =>
    this._actions$.pipe(
      ofType(updateJobAdStatusSuccess),
      filter((action) => action.jobAd.status === 'published'),
      map((action) => {
        return createInvoice({ jobAd: action.jobAd });
      }),
    ),
  );

  constructor(
    private readonly _actions$: Actions,
    private readonly _apiService: ApiService,
    private readonly _store: Store<JobsListState>,
    private readonly _notificationsService: NotificationsService,
  ) {}

  notificationHandler(jobAd: JobAd, action: string) {
    return this._notificationsService.createNotification({
      body: `Job Ad #${jobAd.id} ${action}`,
      title: `${jobAd.title}`,
    });
  }
}
