import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};

export const addNewTaskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewTask', inputVars);
}
addNewTaskRef.operationName = 'AddNewTask';

export function addNewTask(dcOrVars, vars) {
  return executeMutation(addNewTaskRef(dcOrVars, vars));
}

export const listTasksForFarmRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTasksForFarm', inputVars);
}
listTasksForFarmRef.operationName = 'ListTasksForFarm';

export function listTasksForFarm(dcOrVars, vars) {
  return executeQuery(listTasksForFarmRef(dcOrVars, vars));
}

export const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';

export function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
}

export const listAllCropsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCrops');
}
listAllCropsRef.operationName = 'ListAllCrops';

export function listAllCrops(dc) {
  return executeQuery(listAllCropsRef(dc));
}

