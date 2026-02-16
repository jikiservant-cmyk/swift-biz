import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddNewTaskData {
  task_insert: Task_Key;
}

export interface AddNewTaskVariables {
  farmId: UUIDString;
  description: string;
  dueDate: DateString;
  status: string;
}

export interface CropCycle_Key {
  id: UUIDString;
  __typename?: 'CropCycle_Key';
}

export interface Crop_Key {
  id: UUIDString;
  __typename?: 'Crop_Key';
}

export interface Equipment_Key {
  id: UUIDString;
  __typename?: 'Equipment_Key';
}

export interface Farm_Key {
  id: UUIDString;
  __typename?: 'Farm_Key';
}

export interface Field_Key {
  id: UUIDString;
  __typename?: 'Field_Key';
}

export interface ListAllCropsData {
  crops: ({
    id: UUIDString;
    name: string;
    cropType: string;
    description?: string | null;
    harvestSeason?: string | null;
    plantingSeason?: string | null;
  } & Crop_Key)[];
}

export interface ListTasksForFarmData {
  tasks: ({
    id: UUIDString;
    description: string;
    dueDate: DateString;
    status: string;
  } & Task_Key)[];
}

export interface ListTasksForFarmVariables {
  farmId: UUIDString;
}

export interface Livestock_Key {
  id: UUIDString;
  __typename?: 'Livestock_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}

export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}

interface AddNewTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewTaskVariables): MutationRef<AddNewTaskData, AddNewTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddNewTaskVariables): MutationRef<AddNewTaskData, AddNewTaskVariables>;
  operationName: string;
}
export const addNewTaskRef: AddNewTaskRef;

export function addNewTask(vars: AddNewTaskVariables): MutationPromise<AddNewTaskData, AddNewTaskVariables>;
export function addNewTask(dc: DataConnect, vars: AddNewTaskVariables): MutationPromise<AddNewTaskData, AddNewTaskVariables>;

interface ListTasksForFarmRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
  operationName: string;
}
export const listTasksForFarmRef: ListTasksForFarmRef;

export function listTasksForFarm(vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;
export function listTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;

interface UpdateTaskStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  operationName: string;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;

export function updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface ListAllCropsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllCropsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllCropsData, undefined>;
  operationName: string;
}
export const listAllCropsRef: ListAllCropsRef;

export function listAllCrops(): QueryPromise<ListAllCropsData, undefined>;
export function listAllCrops(dc: DataConnect): QueryPromise<ListAllCropsData, undefined>;

