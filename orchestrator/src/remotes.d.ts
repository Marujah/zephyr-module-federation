declare module 'react_remote/mount' {
  export const mount: ((container: Element) => void | (() => void)) | undefined;
  const defaultExport:
    | ((container: Element) => void | (() => void))
    | { mount?: (container: Element) => void | (() => void) };
  export default defaultExport;
}

declare module 'vue_remote/mount' {
  export const mount: ((container: Element) => void | (() => void)) | undefined;
  const defaultExport:
    | ((container: Element) => void | (() => void))
    | { mount?: (container: Element) => void | (() => void) };
  export default defaultExport;
}
