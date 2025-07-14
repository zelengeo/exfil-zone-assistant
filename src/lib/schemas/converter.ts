import { z } from 'zod';
import { Schema as MongooseSchema } from 'mongoose';

export function createMongooseSchema<T extends z.ZodObject<any>>(
    zodSchema: T,
    options?: {
        timestamps?: boolean;
        additionalFields?: Record<string, any>;
        indexes?: Array<{ fields: Record<string, 1 | -1>; options?: any }>;
    }
): MongooseSchema {
    const schemaDefinition = zodToMongooseDefinition(zodSchema);

    // Add additional fields
    if (options?.additionalFields) {
        Object.assign(schemaDefinition, options.additionalFields);
    }

    const mongooseSchema = new MongooseSchema(schemaDefinition, {
        timestamps: options?.timestamps ?? true,
    });

    // Add indexes
    options?.indexes?.forEach(({ fields, options }) => {
        mongooseSchema.index(fields, options);
    });

    return mongooseSchema;
}

function zodToMongooseDefinition(zodSchema: z.ZodObject<any>): any {
    const definition: any = {};

    Object.entries(zodSchema.shape).forEach(([key, zodType]) => {
        definition[key] = zodTypeToMongooseType(zodType);
    });

    return definition;
}

function zodTypeToMongooseType(zodType: any): any {
    // Handle optional types
    if (zodType instanceof z.ZodOptional) {
        const innerType = zodTypeToMongooseType(zodType._def.innerType);
        return { ...innerType, required: false };
    }

    // Handle default types
    if (zodType instanceof z.ZodDefault) {
        const innerType = zodTypeToMongooseType(zodType._def.innerType);
        return { ...innerType, default: zodType._def.defaultValue() };
    }

    // String
    if (zodType instanceof z.ZodString) {
        const mongooseType: any = { type: String, required: true };

        zodType._def.checks?.forEach((check: any) => {
            if (check.kind === 'max') mongooseType.maxlength = check.value;
            if (check.kind === 'min') mongooseType.minlength = check.value;
        });

        return mongooseType;
    }

    // Number
    if (zodType instanceof z.ZodNumber) {
        return { type: Number, required: true };
    }

    // Boolean
    if (zodType instanceof z.ZodBoolean) {
        return { type: Boolean, required: true };
    }

    // Date
    if (zodType instanceof z.ZodDate) {
        return { type: Date, required: true };
    }

    // Enum
    if (zodType instanceof z.ZodEnum) {
        return { type: String, enum: zodType._def.values, required: true };
    }

    // Array
    if (zodType instanceof z.ZodArray) {
        const itemType = zodTypeToMongooseType(zodType._def.type);
        return [itemType.type || itemType];
    }

    // Object (nested schema)
    if (zodType instanceof z.ZodObject) {
        return zodToMongooseDefinition(zodType);
    }

    // Default fallback
    return { type: MongooseSchema.Types.Mixed };
}