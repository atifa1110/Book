import bcrypt from 'bcryptjs';

// Hash password function
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); // Generate salt with rounds of 10
  const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
  return hashedPassword;
};

// Compare password function
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword); // Compare the plain password with the hashed password
};
