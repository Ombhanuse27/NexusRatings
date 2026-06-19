export const validateUserForm = (name, email, password, address) => {
  const errors = [];
  
  if (!name || name.length < 20 || name.length > 60) {
    errors.push("Name must be between 20 and 60 characters.");
  }
  if (!address || address.length > 400) {
    errors.push("Address cannot exceed 400 characters.");
  }
  if (!password || !/^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/.test(password)) {
    errors.push("Password must be 8-16 characters, with at least one uppercase letter and one special character.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Must be a valid email address.");
  }
  
  return errors;
};