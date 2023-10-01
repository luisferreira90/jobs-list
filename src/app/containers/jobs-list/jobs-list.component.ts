import { Component, OnInit } from '@angular/core';
import { getJobsList } from './store/jobs-list.actions';
import { Store } from '@ngrx/store';
import { JobsListPageParams } from '../../models/models';
import { selectJobsList, selectJobsListTotalCount } from './store';
import { PageEvent } from '@angular/material/paginator';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.css'],
})
export class JobsListComponent implements OnInit {
  jobsList$ = this._jobsListStore.select(selectJobsList);
  totalCount$ = this._jobsListStore.select(selectJobsListTotalCount);

  jobsListParams: JobsListPageParams = {
    page: 0,
    pageSize: 10,
  };

  constructor(private _jobsListStore: Store) {}

  ngOnInit(): void {
    this._getJobsList();
  }

  pageChange(paginationEvent: PageEvent): void {
    this.jobsListParams = {
      ...this.jobsListParams,
      // json-server pages start at 1, while Angular Material's Paginator starts at 0, hence the +1
      page: paginationEvent.pageIndex + 1,
      pageSize: paginationEvent.pageSize,
    };

    this._getJobsList();
  }

  updateParams(params: Partial<JobsListPageParams>): void {
    this.jobsListParams = {
      ...this.jobsListParams,
      ...params,
    };

    this._getJobsList();
  }

  private _getJobsList(): void {
    this._jobsListStore.dispatch(getJobsList({ params: { ...this.jobsListParams } }));
  }
}
