const contextMap = new Map();

function getContext(sessionId) {
  return contextMap.get(sessionId) || {};
}

function setContext(sessionId, context) {
  contextMap.set(sessionId, context);
}

function clearContext(sessionId) {
  contextMap.delete(sessionId);
}

module.exports = { getContext, setContext, clearContext };
