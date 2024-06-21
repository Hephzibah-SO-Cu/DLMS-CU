import { z } from "zod";

export const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

export const state = {
  email: undefined,
  password: undefined,
};


// forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const forgotPasswordState = {
  email: undefined,
};

export const petSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters"),
  age: z.number().min(0, "Must be at least 0"),
  breed: z.string().min(3, "Must be at least 3 characters"),
  // type: z.string(),
});

export const petState = <{
  name: string | undefined;
  age: number | undefined;
  breed: string | undefined;
}>({
  name: undefined,
  age: undefined,
  breed: undefined,
});


export const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2, 'First Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last Name must be at least 2 characters'),
  role: z.enum(['admin', 'student', 'instructor'], {
    message: "Wrong Role passed"
  })
})
