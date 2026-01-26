
'use client';

import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  DocumentReference,
  CollectionReference,
  SetOptions,
  WithFieldValue,
  PartialWithFieldValue,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// For setDoc
export function setDocumentNonBlocking<T>(
  reference: DocumentReference<T>,
  data: WithFieldValue<T>
): void;
export function setDocumentNonBlocking<T>(
  reference: DocumentReference<T>,
  data: PartialWithFieldValue<T>,
  options: SetOptions
): void;
export function setDocumentNonBlocking<T>(
  reference: DocumentReference<T>,
  data: any,
  options?: SetOptions
) {
  const operation = options && 'merge' in options ? 'update' : 'create';
  
  const promise = options 
    ? setDoc(reference, data, options)
    : setDoc(reference, data);

  promise.catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: reference.path,
      operation: operation,
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

// For addDoc
export function addDocumentNonBlocking<T>(
  reference: CollectionReference<T>,
  data: WithFieldValue<T>
) {
  addDoc(reference, data)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: reference.path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

// For updateDoc
export function updateDocumentNonBlocking<T extends DocumentData>(
    reference: DocumentReference<T>,
    data: PartialWithFieldValue<T>
) {
    updateDoc(reference, data)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: reference.path,
                operation: 'update',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
}


// For deleteDoc
export function deleteDocumentNonBlocking(
  reference: DocumentReference<any>
) {
  deleteDoc(reference)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: reference.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
