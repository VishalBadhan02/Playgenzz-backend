const { z } = require("zod");

// Schema validation using Zod
const updateProfileSchema = z.object({
    userName: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

const searchSchema = z.object({
    q: z.string().max(50).optional()
});

module.exports ={
    updateProfileSchema,
    searchSchema
}