let yamlUrl;

export function initialize(data) {
  yamlUrl = data.yamlUrl;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier === "js-yaml") return { url: yamlUrl, shortCircuit: true };
  return nextResolve(specifier, context);
}
