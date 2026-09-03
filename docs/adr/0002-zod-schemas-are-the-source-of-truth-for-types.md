# Zod schemas are the source of truth for types

Anything crossing the API boundary is defined once as a zod schema in `lib/schemas/` and its
TypeScript type inferred from it with `z.infer`, rather than written as an interface beside a
separate validator.

A hand-written type and a runtime validator describing the same payload are two statements of one
fact, and nothing keeps them agreeing: the type passes review while the validator drifts, and the
mismatch surfaces as a runtime rejection of a request the compiler said was fine. Inferring from the
schema makes that class of bug unrepresentable, at the cost of reading types indirectly and of
schema syntax being the way a shape is expressed.

This is why routes parse with `XApi.Endpoint.Request` and type responses with
`IXApi['Endpoint']['Response']`, and why the models doc says a Mongoose document is an
implementation detail rather than a source of types.
