let originalFN: any = {};

export function mockFunction(MockedModule: any, fnName: string, value: () => any) {
  originalFN[fnName] = originalFN[fnName] || MockedModule[fnName];
  Object.defineProperty(MockedModule, fnName, { value })
}

export function restoreFunctions(MockedModule: any) {
  Object.entries(originalFN).forEach(([fnName, value]) => {
    Object.defineProperty(MockedModule, fnName, { value })
    delete originalFN[fnName]
  })
}
