import { getAllExercises, getExercise, saveExercise as _save } from '../../utils/exerciseStorage';

export const localRepo = {
  getAll: () => getAllExercises(),
  getOne: (exId) => getExercise(exId),
  save: (exId, data) => _save(exId, data),
};
