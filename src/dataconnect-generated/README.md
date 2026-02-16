# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListTasksForFarm*](#listtasksforfarm)
  - [*ListAllCrops*](#listallcrops)
- [**Mutations**](#mutations)
  - [*AddNewTask*](#addnewtask)
  - [*UpdateTaskStatus*](#updatetaskstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListTasksForFarm
You can execute the `ListTasksForFarm` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTasksForFarm(vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;

interface ListTasksForFarmRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
}
export const listTasksForFarmRef: ListTasksForFarmRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTasksForFarm(dc: DataConnect, vars: ListTasksForFarmVariables): QueryPromise<ListTasksForFarmData, ListTasksForFarmVariables>;

interface ListTasksForFarmRef {
  ...
  (dc: DataConnect, vars: ListTasksForFarmVariables): QueryRef<ListTasksForFarmData, ListTasksForFarmVariables>;
}
export const listTasksForFarmRef: ListTasksForFarmRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTasksForFarmRef:
```typescript
const name = listTasksForFarmRef.operationName;
console.log(name);
```

### Variables
The `ListTasksForFarm` query requires an argument of type `ListTasksForFarmVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTasksForFarmVariables {
  farmId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTasksForFarm` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTasksForFarmData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTasksForFarmData {
  tasks: ({
    id: UUIDString;
    description: string;
    dueDate: DateString;
    status: string;
  } & Task_Key)[];
}
```
### Using `ListTasksForFarm`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTasksForFarm, ListTasksForFarmVariables } from '@dataconnect/generated';

// The `ListTasksForFarm` query requires an argument of type `ListTasksForFarmVariables`:
const listTasksForFarmVars: ListTasksForFarmVariables = {
  farmId: ..., 
};

// Call the `listTasksForFarm()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTasksForFarm(listTasksForFarmVars);
// Variables can be defined inline as well.
const { data } = await listTasksForFarm({ farmId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTasksForFarm(dataConnect, listTasksForFarmVars);

console.log(data.tasks);

// Or, you can use the `Promise` API.
listTasksForFarm(listTasksForFarmVars).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

### Using `ListTasksForFarm`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTasksForFarmRef, ListTasksForFarmVariables } from '@dataconnect/generated';

// The `ListTasksForFarm` query requires an argument of type `ListTasksForFarmVariables`:
const listTasksForFarmVars: ListTasksForFarmVariables = {
  farmId: ..., 
};

// Call the `listTasksForFarmRef()` function to get a reference to the query.
const ref = listTasksForFarmRef(listTasksForFarmVars);
// Variables can be defined inline as well.
const ref = listTasksForFarmRef({ farmId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTasksForFarmRef(dataConnect, listTasksForFarmVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tasks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

## ListAllCrops
You can execute the `ListAllCrops` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllCrops(): QueryPromise<ListAllCropsData, undefined>;

interface ListAllCropsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllCropsData, undefined>;
}
export const listAllCropsRef: ListAllCropsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllCrops(dc: DataConnect): QueryPromise<ListAllCropsData, undefined>;

interface ListAllCropsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllCropsData, undefined>;
}
export const listAllCropsRef: ListAllCropsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllCropsRef:
```typescript
const name = listAllCropsRef.operationName;
console.log(name);
```

### Variables
The `ListAllCrops` query has no variables.
### Return Type
Recall that executing the `ListAllCrops` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllCropsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAllCrops`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllCrops } from '@dataconnect/generated';


// Call the `listAllCrops()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllCrops();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllCrops(dataConnect);

console.log(data.crops);

// Or, you can use the `Promise` API.
listAllCrops().then((response) => {
  const data = response.data;
  console.log(data.crops);
});
```

### Using `ListAllCrops`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllCropsRef } from '@dataconnect/generated';


// Call the `listAllCropsRef()` function to get a reference to the query.
const ref = listAllCropsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllCropsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.crops);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.crops);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddNewTask
You can execute the `AddNewTask` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addNewTask(vars: AddNewTaskVariables): MutationPromise<AddNewTaskData, AddNewTaskVariables>;

interface AddNewTaskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewTaskVariables): MutationRef<AddNewTaskData, AddNewTaskVariables>;
}
export const addNewTaskRef: AddNewTaskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addNewTask(dc: DataConnect, vars: AddNewTaskVariables): MutationPromise<AddNewTaskData, AddNewTaskVariables>;

interface AddNewTaskRef {
  ...
  (dc: DataConnect, vars: AddNewTaskVariables): MutationRef<AddNewTaskData, AddNewTaskVariables>;
}
export const addNewTaskRef: AddNewTaskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addNewTaskRef:
```typescript
const name = addNewTaskRef.operationName;
console.log(name);
```

### Variables
The `AddNewTask` mutation requires an argument of type `AddNewTaskVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddNewTaskVariables {
  farmId: UUIDString;
  description: string;
  dueDate: DateString;
  status: string;
}
```
### Return Type
Recall that executing the `AddNewTask` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddNewTaskData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddNewTaskData {
  task_insert: Task_Key;
}
```
### Using `AddNewTask`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addNewTask, AddNewTaskVariables } from '@dataconnect/generated';

// The `AddNewTask` mutation requires an argument of type `AddNewTaskVariables`:
const addNewTaskVars: AddNewTaskVariables = {
  farmId: ..., 
  description: ..., 
  dueDate: ..., 
  status: ..., 
};

// Call the `addNewTask()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addNewTask(addNewTaskVars);
// Variables can be defined inline as well.
const { data } = await addNewTask({ farmId: ..., description: ..., dueDate: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addNewTask(dataConnect, addNewTaskVars);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
addNewTask(addNewTaskVars).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

### Using `AddNewTask`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addNewTaskRef, AddNewTaskVariables } from '@dataconnect/generated';

// The `AddNewTask` mutation requires an argument of type `AddNewTaskVariables`:
const addNewTaskVars: AddNewTaskVariables = {
  farmId: ..., 
  description: ..., 
  dueDate: ..., 
  status: ..., 
};

// Call the `addNewTaskRef()` function to get a reference to the mutation.
const ref = addNewTaskRef(addNewTaskVars);
// Variables can be defined inline as well.
const ref = addNewTaskRef({ farmId: ..., description: ..., dueDate: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addNewTaskRef(dataConnect, addNewTaskVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

## UpdateTaskStatus
You can execute the `UpdateTaskStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface UpdateTaskStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface UpdateTaskStatusRef {
  ...
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTaskStatusRef:
```typescript
const name = updateTaskStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateTaskStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTaskStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}
```
### Using `UpdateTaskStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTaskStatus, UpdateTaskStatusVariables } from '@dataconnect/generated';

// The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`:
const updateTaskStatusVars: UpdateTaskStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTaskStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTaskStatus(updateTaskStatusVars);
// Variables can be defined inline as well.
const { data } = await updateTaskStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTaskStatus(dataConnect, updateTaskStatusVars);

console.log(data.task_update);

// Or, you can use the `Promise` API.
updateTaskStatus(updateTaskStatusVars).then((response) => {
  const data = response.data;
  console.log(data.task_update);
});
```

### Using `UpdateTaskStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTaskStatusRef, UpdateTaskStatusVariables } from '@dataconnect/generated';

// The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`:
const updateTaskStatusVars: UpdateTaskStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTaskStatusRef()` function to get a reference to the mutation.
const ref = updateTaskStatusRef(updateTaskStatusVars);
// Variables can be defined inline as well.
const ref = updateTaskStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTaskStatusRef(dataConnect, updateTaskStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_update);
});
```

