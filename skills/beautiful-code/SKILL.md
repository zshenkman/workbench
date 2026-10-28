---
name: beautiful-code
description: Code-quality principles that apply to all code. Load before any task involving code, including reading, reviewing, or planning it.
---

# Beautiful Code

> "A great carpenter isn't going to use lousy wood for the back of a cabinet, even though nobody's going to see it." — Steve Jobs

Treat every part of this codebase as the front of the cabinet. Internal helpers, tests, scripts, and error paths deserve the same care as the public-facing code.

## Reviewing a diff

Read the diff against every principle below. Fix clear violations only; the guide is a lens for the change, not a reason to add abstractions or defensive code. Items marked **(oxlint)** are enforced by the linter, so skip them in projects where oxlint runs.

## Principles

- **Write for the next reader.** Choose names that say what something is or does. Replace unexplained values with named constants.
- **One concept, one name.** Once something is a "customer," it's a customer everywhere: in variables, functions, files, and the UI.
- **Match existing patterns.** Follow the conventions already in the codebase. Consistency beats personal preference.
- **Design shapes for the future, build features for today.** Data models, types, and API contracts are hard to change later, so shape them to grow. Build only the features needed now. If changing something later would mean a data migration or touching every caller, design it carefully now. Otherwise, keep it simple (YAGNI, as Martin Fowler frames it).
- **Give each piece one job.** Keep input handling, business logic, and side effects like network or storage in separate units (single responsibility).
- **Keep logic pure; push side effects to the edges.** Business logic should take inputs and return outputs. Reading the clock, the network, or the database belongs in a thin layer around it.
- **Small interfaces, hidden details.** Expose as little as possible from each module and keep the complexity inside.
- **Keep related things together.** Put code, types, and tests near what they belong to.
- **Abstract real concepts, not coincidences.** Extract a function when its name says more than its body and callers never need to look inside. Code that looks alike but changes for different reasons stays separate; wait until a pattern shows up about three times. If an abstraction needs flags to serve each caller, split it into clearly named functions. Skip wrappers that only pass calls through. Often a named variable is better than a new function.
- **Make invalid state impossible.** Model data so contradictory combinations can't exist. Avoid escape hatches like `any` (oxlint). Handle every case of a union (oxlint).
- **Derive, don't duplicate.** Compute values from their source instead of storing copies that can drift out of sync.
- **Fail loudly and early.** Return early instead of nesting (oxlint), validate data where it enters the system, and never hide an error (oxlint).
- **Optimize only when measured.** Clear code first. Add caching or other optimizations when there's a real performance problem.
- **Understand before you delete.** Find out why unusual code exists before removing it.
- **Improve what you touch, and only that.** Clean up the code you're changing; keep unrelated cleanup in a separate change.
- **Test behavior, not implementation details.** Test what callers observe, not internal state.
- **Let tools own formatting.** The formatter and linter (`oxfmt` and `oxlint` where configured) own the mechanical rules.

## Examples

Examples use TypeScript, but the principles apply in any language.

### Names that say what they mean

BAD

```ts
const d = u.filter((x) => x.a);
```

GOOD

```ts
const activeUsers = users.filter((user) => user.isActive);
```

### Return early instead of nesting (oxlint)

BAD

```ts
if (order) {
  if (order.items.length > 0) {
    return placeOrder(order);
  } else {
    throw new Error("Cannot place an empty order");
  }
} else {
  throw new Error("Order not found");
}
```

GOOD

```ts
if (!order) throw new Error("Order not found");
if (order.items.length === 0) throw new Error("Cannot place an empty order");
return placeOrder(order);
```

### One job per unit

BAD

```ts
// registerUser() validates input, writes to the database, and sends an email.
await registerUser(form);
```

GOOD

```ts
const input = parseRegistration(form);
const user = await createUser(input);
await sendWelcomeEmail(user);
```

### One concept, one name

BAD

```ts
// Three names for the same thing.
getCustomer(id);
updateClient(id, changes);
deleteAccountHolder(id);
```

GOOD

```ts
getCustomer(id);
updateCustomer(id, changes);
deleteCustomer(id);
```

### Pure logic, side effects at the edges

BAD

```ts
// Logic reads the database and the clock, so it's hard to test.
async function getDiscount(userId: string) {
  const user = await db.users.find(userId);
  return user.isMember && isHolidaySeason(new Date()) ? MEMBER_HOLIDAY_DISCOUNT : 0;
}
```

GOOD

```ts
// Logic takes inputs and returns a value; the caller does the I/O.
function getDiscount(user: User, today: Date): number {
  return user.isMember && isHolidaySeason(today) ? MEMBER_HOLIDAY_DISCOUNT : 0;
}

const discount = getDiscount(await db.users.find(userId), new Date());
```

### Small interface, hidden details

BAD

```ts
// Callers must understand how caching works.
export const rateCache = new Map<string, CachedRate>();
export function buildRateCacheKey(from: Currency, to: Currency) { /* ... */ }
export function isRateExpired(rate: CachedRate) { /* ... */ }
```

GOOD

```ts
// One function; caching is an internal detail.
export function getExchangeRate(from: Currency, to: Currency): Promise<number> { /* ... */ }
```

### Clear functions over boolean flags

BAD

```ts
// What does `true` mean here?
formatDate(date, true);
```

GOOD

```ts
formatShortDate(date);
formatLongDate(date);
```

### Name it before you extract it

BAD

```ts
// A one-line wrapper that adds a jump and nothing else.
function getUserName(user: User) {
  return user.name;
}

// Unnamed logic the reader has to decode.
if (order.status === "delivered" && daysSince(order.deliveredAt) <= REFUND_WINDOW_DAYS) {
  /* ... */
}
```

GOOD

```ts
// A named variable. Promote it to a function once a second place needs it.
const isRefundable =
  order.status === "delivered" && daysSince(order.deliveredAt) <= REFUND_WINDOW_DAYS;
if (isRefundable) {
  /* ... */
}
```

### Make invalid state impossible (discriminated unions)

BAD

```ts
// Allows loading, error, and data all at once.
type UserFetchState = { isLoading: boolean; error?: Error; data?: User };
```

GOOD

```ts
type UserFetchState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: User };
```

### Future-proof the shape, not the code

BAD

```ts
// Can't grow: a boolean has only two states.
isPaid: boolean;

// Builds ahead: nothing handles refunds yet.
status: "pending" | "paid" | "refunded";
```

GOOD

```ts
// Can grow, holds only what exists today.
status: "pending" | "paid";
```

### Derive, don't duplicate

BAD

```ts
// total must be kept in sync by hand.
cart.items.push(item);
cart.total += item.price;
```

GOOD

```ts
const total = cart.items.reduce((sum, item) => sum + item.price, 0);
```

### Never hide errors (oxlint)

BAD

```ts
try {
  await saveProfile(profile);
} catch {}
```

GOOD

```ts
try {
  await saveProfile(profile);
} catch (error) {
  throw new Error("Failed to save profile", { cause: error });
}
```

### Comments explain why, not what

BAD

```ts
// Wait one second
await sleep(1000);
```

GOOD

```ts
// The payments API rejects bursts of requests, so pause between retries.
await sleep(1000);
```

### Test behavior, not internals

BAD

```ts
expect(cart.items.length).toBe(1);
```

GOOD

```ts
cart.add(book);
expect(cart.total()).toBe(12);
```

## React

These apply only in React and React Native code.

### Split data from display (one job per unit)

BAD

```tsx
// One component fetches, transforms, and renders.
function OrdersScreen() {
  /* fetch + sort + filter + 200 lines of JSX */
}
```

GOOD

```tsx
// A custom hook owns the data; a component owns the display.
function OrdersScreen({ userId }: { userId: string }) {
  const { orders, status } = useOrders(userId);
  return <OrderList orders={orders} status={status} />;
}
```
