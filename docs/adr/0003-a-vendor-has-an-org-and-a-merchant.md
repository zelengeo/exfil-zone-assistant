# A vendor has an org and a merchant; there is no Corp

The six shop fronts were described by three competing words. `corps` in the task data called them
corps and gave each a `name`, an `icon`, a `merchant` and a `merchantIcon`; the trade and UI layers
called the same thing a vendor, 149 uses against 16; the tasks route called it an owner. `Corp` was
the only one of the three with no referent in the game's own files.

The decision: **Vendor** is the thing, and it has two named halves — an **Org** (the organisation:
ARK, Neumann) and a **Merchant** (the person behind the counter: Tommy, Anna), one each. `Corp` is
retired. The asymmetry that caused the confusion was in the data shape, where `name` and `icon` sat
unqualified beside a qualified `merchant` and `merchantIcon`, so "what is `name`?" had no local
answer.

`ChainOwner` and `OwnerFace` in the tasks route are kept but are a **presentation grouping**, not a
claim about ownership: they are the seven columns the rail draws, which is the six vendors plus the
dailies. Dailies are a kind of task with no vendor, and modelling them as a synthetic owner is a
convenience of the rail, not a fact about the domain.

The full vocabulary, including the three meanings of "gunsmith" and the rule that an id prefix
carries no meaning, is in [`CONTEXT.md`](../../CONTEXT.md).
