import { AddNewTaskData, AddNewTaskVariables, ListTasksForFarmData, ListTasksForFarmVariables, UpdateTaskStatusData, UpdateTaskStatusVariables, ListAllCropsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAddNewTask(options?: useDataConnectMutationOptions<AddNewTaskData, FirebaseError, AddNewTaskVariables>): UseDataConnectMutationResult<AddNewTaskData, AddNewTaskVariables>;
export function useAddNewTask(dc: DataConnect, options?: useDataConnectMutationOptions<AddNewTaskData, FirebaseError, AddNewTaskVariables>): UseDataConnectMutationResult<AddNewTaskData, AddNewTaskVariables>;

export function useListTasksForFarm(vars: ListTasksForFarmVariables, options?: useDataConnectQueryOptions<ListTasksForFarmData>): UseDataConnectQueryResult<ListTasksForFarmData, ListTasksForFarmVariables>;
export function useListTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables, options?: useDataConnectQueryOptions<ListTasksForFarmData>): UseDataConnectQueryResult<ListTasksForFarmData, ListTasksForFarmVariables>;

export function useUpdateTaskStatus(options?: useDataConnectMutationOptions<UpdateTaskStatusData, FirebaseError, UpdateTaskStatusVariables>): UseDataConnectMutationResult<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function useUpdateTaskStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTaskStatusData, FirebaseError, UpdateTaskStatusVariables>): UseDataConnectMutationResult<UpdateTaskStatusData, UpdateTaskStatusVariables>;

export function useListAllCrops(options?: useDataConnectQueryOptions<ListAllCropsData>): UseDataConnectQueryResult<ListAllCropsData, undefined>;
export function useListAllCrops(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllCropsData>): UseDataConnectQueryResult<ListAllCropsData, undefined>;
