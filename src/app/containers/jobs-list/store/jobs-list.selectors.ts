import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JobsListState } from './jobs-list.reducer';

export const featureKey = 'jobsList';

export const selectJobsListState = createFeatureSelector<JobsListState>(featureKey);

export const selectJobsListAction = createSelector(selectJobsListState, (state) => state.event);

export const selectJobsList = createSelector(selectJobsListState, (state) => state.jobsList);

export const selectJobsListTotalCount = createSelector(
  selectJobsListState,
  (state) => state.totalCount,
);

export const selectJobsListParams = createSelector(
  selectJobsListState,
  (state) => state.jobsListParams,
);

export const selectJobsListPageViewModel = createSelector(
  selectJobsList,
  selectJobsListTotalCount,
  selectJobsListAction,
  (jobsList, totalCount, action) => ({
    jobsList,
    totalCount,
    action,
  }),
);
