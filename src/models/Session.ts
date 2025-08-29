// models/Session.ts
// import { Schema, model, models } from 'mongoose';
//
// const SessionSchema = new Schema({
//     sessionToken: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     expires: {
//         type: Date,
//         required: true
//     },
// });
//
// // Index for efficient queries
// SessionSchema.index({ sessionToken: 1 });
// SessionSchema.index({ userId: 1 });
//
// // export const Session = models.Session || model('Session', SessionSchema);