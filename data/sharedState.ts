type UpdateCallback = () => void;

let updateCallbacks: UpdateCallback[] = [];

export const subscribeToUpdates = (callback: UpdateCallback) => {
  updateCallbacks.push(callback);
  return () => {
    updateCallbacks = updateCallbacks.filter(cb => cb !== callback);
  };
};

export const notifyUpdates = () => {
  updateCallbacks.forEach(callback => callback());
};