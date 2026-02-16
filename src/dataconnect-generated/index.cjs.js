const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const addNewTaskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewTask', inputVars);
}
addNewTaskRef.operationName = 'AddNewTask';
exports.addNewTaskRef = addNewTaskRef;

exports.addNewTask = function addNewTask(dcOrVars, vars) {
  return executeMutation(addNewTaskRef(dcOrVars, vars));
};

const listTasksForFarmRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTasksForFarm', inputVars);
}
listTasksForFarmRef.operationName = 'ListTasksForFarm';
exports.listTasksForFarmRef = listTasksForFarmRef;

exports.listTasksForFarm = function listTasksForFarm(dcOrVars, vars) {
  return executeQuery(listTasksForFarmRef(dcOrVars, vars));
};

const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';
exports.updateTaskStatusRef = updateTaskStatusRef;

exports.updateTaskStatus = function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
};

const listAllCropsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCrops');
}
listAllCropsRef.operationName = 'ListAllCrops';
exports.listAllCropsRef = listAllCropsRef;

exports.listAllCrops = function listAllCrops(dc) {
  return executeQuery(listAllCropsRef(dc));
};
