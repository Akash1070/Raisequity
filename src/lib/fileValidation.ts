export type ValidationResult = {
  valid: boolean;
  error?: string;
};

// Check file magic numbers (first few bytes) to verify actual content type
// This prevents someone renaming a .exe to .pdf or .jpg
const verifyMagicBytes = (file: File, validBytes: number[][]): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result) return resolve(false);
      
      const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 4);
      
      const isValid = validBytes.some(signature => {
        return signature.every((byte, i) => byte === arr[i]);
      });
      
      resolve(isValid);
    };
    reader.onerror = () => resolve(false);
    // Read only the first 4 bytes
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

export const validateFile = async (file: File, type: 'avatar' | 'pitchdeck'): Promise<ValidationResult> => {
  if (type === 'avatar') {
    // Check max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      return { valid: false, error: 'Avatar must be less than 2MB' };
    }
    
    // Check MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      return { valid: false, error: 'Avatar must be a JPEG, PNG, or WebP image' };
    }

    // Check magic bytes
    const validSignatures = [
      [0xFF, 0xD8, 0xFF], // JPEG
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0x52, 0x49, 0x46, 0x46], // WebP (starts with RIFF)
    ];
    
    const hasValidSignature = await verifyMagicBytes(file, validSignatures);
    if (!hasValidSignature) {
      return { valid: false, error: 'Invalid image file content' };
    }
    
    return { valid: true };
  }

  if (type === 'pitchdeck') {
    // Check max size: 20MB
    if (file.size > 20 * 1024 * 1024) {
      return { valid: false, error: 'Pitch deck must be less than 20MB' };
    }
    
    // Check MIME type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Pitch deck must be a PDF file' };
    }

    // Check magic bytes for PDF (%PDF -> 25 50 44 46)
    const validSignatures = [
      [0x25, 0x50, 0x44, 0x46]
    ];
    
    const hasValidSignature = await verifyMagicBytes(file, validSignatures);
    if (!hasValidSignature) {
      return { valid: false, error: 'Invalid PDF file content' };
    }
    
    return { valid: true };
  }

  return { valid: false, error: 'Unknown file type' };
};
