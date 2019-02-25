export { mockFunction, restoreFunctions } from "./mockFunction.helper";

export const returnTrue = jest.fn().mockReturnValue(true);
export const returnFalse = jest.fn().mockReturnValue(false);
export const needsSpecification = jest.fn(() => {throw new Error("Needs specification");});
