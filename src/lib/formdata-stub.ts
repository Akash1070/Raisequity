export const FormData = typeof window !== 'undefined' ? window.FormData : globalThis.FormData;
export const Blob = typeof window !== 'undefined' ? window.Blob : globalThis.Blob;
export const File = typeof window !== 'undefined' ? window.File : globalThis.File;
export const formData = FormData;
export default FormData;

