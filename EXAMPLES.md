#  PDA Visualizer — Example Data & Test Cases

> **Complete reference for testing the PDA Visualizer with sample configurations and expected results.**

---

## How to Use This File

1. **Copy the configuration** from any example below
2. **Paste into the app** (or click pre-loaded examples)
3. **Enter the test string**
4. **Click ▶ Play**
5. **Verify the result** matches expected output

---

##  Pre-loaded Examples (Built-in)

These are already available in the app — just click the example cards!

### Example 1: Balanced Parentheses

**Click:** "Balanced Parentheses" example card

**Configuration:**
```
States: q0, q1, q2*
Input Alphabet: (, )
Stack Alphabet: Z0, A
```

**Transitions:**
```
δ(q0, (, Z0) → (q0, AZ0)
δ(q0, (, A)  → (q0, AA)
δ(q0, ), A)  → (q0, ε)
δ(q0, ε, Z0) → (q2, ε)
```

**Test Strings:**

| # | Input | Expected | Steps | Notes |
|---|-------|----------|-------|-------|
| 1 | `(())` | ACCEPTED | 5 steps | Properly nested |
| 2 | `()()` | ACCEPTED | 5 steps | Two pairs |
| 3 | `((()))` | ACCEPTED | 7 steps | Three nested |
| 4 | `(()` | REJECTED | 4 steps | Missing `)` |
| 5 | `())` | REJECTED | 3 steps | Extra `)` |
| 6 | `)(` | REJECTED | 1 step | Wrong order |

---

### Example 2: aⁿbⁿ Language

**Click:** "aⁿbⁿ Language" example card

**Configuration:**
```
States: q0, q1, q2*
Input Alphabet: a, b
Stack Alphabet: Z0, A
```

**Transitions:**
```
δ(q0, a, Z0) → (q0, AZ0)
δ(q0, a, A)  → (q0, AA)
δ(q0, b, A)  → (q1, ε)
δ(q1, b, A)  → (q1, ε)
δ(q1, ε, Z0) → (q2, Z0)
```

**Test Strings:**

| # | Input | Expected | Steps | Notes |
|---|-------|----------|-------|-------|
| 1 | `aabb` | ACCEPTED | 6 steps | 2 a's, 2 b's |
| 2 | `aaabbb` | ACCEPTED | 8 steps | 3 a's, 3 b's |
| 3 | `ab` | ACCEPTED | 4 steps | 1 a, 1 b |
| 4 | `aaaabbbb` | ACCEPTED | 10 steps | 4 a's, 4 b's |
| 5 | `aaab` | REJECTED | 5 steps | Unequal count |
| 6 | `aabbcc` | REJECTED | 6 steps | Extra `c` |
| 7 | `abab` | REJECTED | 3 steps | Mixed order |
| 8 | `bbaa` | REJECTED | 1 step | Wrong order |

---

### Example 3: wcwᴿ Palindrome

**Click:** "wcwᴿ Palindrome" example card

**Configuration:**
```
States: q0, q1, q2*
Input Alphabet: a, b, c
Stack Alphabet: Z0, A, B
```

**Transitions:**
```
δ(q0, a, Z0) → (q0, AZ0)
δ(q0, a, A)  → (q0, AA)
δ(q0, a, B)  → (q0, AB)
δ(q0, b, Z0) → (q0, BZ0)
δ(q0, b, A)  → (q0, BA)
δ(q0, b, B)  → (q0, BB)
δ(q0, c, ε)  → (q1, ε)
δ(q1, a, A)  → (q1, ε)
δ(q1, b, B)  → (q1, ε)
δ(q1, ε, Z0) → (q2, Z0)
```

**Test Strings:**

| # | Input | Expected | Steps | Notes |
|---|-------|----------|-------|-------|
| 1 | `abcba` | ACCEPTED | 7 steps | `ab` + `c` + `ba` |
| 2 | `aacaa` | ACCEPTED | 5 steps | `a` + `c` + `a` |
| 3 | `abacaba` | ACCEPTED | 9 steps | `aba` + `c` + `aba` |
| 4 | `bccb` | ACCEPTED | 6 steps | `b` + `c` + `b` |
| 5 | `abcd` | REJECTED | 5 steps | No `c` marker |
| 6 | `abccba` | REJECTED | 7 steps | Two `c`'s |
| 7 | `abc` | REJECTED | 4 steps | Missing second half |
| 8 | `cba` | REJECTED | 2 steps | Wrong order |

---

## 🔧 Manual Configuration Examples

Use these to practice creating custom PDAs!

### Example 4: Even Number of a's

**Manual Setup:**

**Configuration:**
```
States: q0*, q1
Input Alphabet: a
Stack Alphabet: Z0
```

**Transitions (add manually):**
```
δ(q0, a, Z0) → (q1, Z0)
δ(q1, a, Z0) → (q0, Z0)
```

**Test Strings:**

| # | Input | Expected | Notes |
|---|-------|----------|-------|
| 1 | `aa` | ACCEPTED | 2 a's (even) |
| 2 | `aaaa` | ACCEPTED | 4 a's (even) |
| 3 | `a` | REJECTED | 1 a (odd) |
| 4 | `aaa` | REJECTED | 3 a's (odd) |

---

### Example 5: Strings Starting with 'a'

**Manual Setup:**

**Configuration:**
```
States: q0, q1, q2*
Input Alphabet: a, b
Stack Alphabet: Z0
```

**Transitions (add manually):**
```
δ(q0, a, Z0) → (q1, Z0)
δ(q1, a, Z0) → (q1, Z0)
δ(q1, b, Z0) → (q1, Z0)
δ(q1, ε, Z0) → (q2, ε)
```

**Test Strings:**

| # | Input | Expected | Notes |
|---|-------|----------|-------|
| 1 | `abba` | ACCEPTED | Starts with `a` |
| 2 | `a` | ACCEPTED | Just `a` |
| 3 | `aa` | ACCEPTED | Starts with `a` |
| 4 | `bba` | REJECTED | Starts with `b` |
| 5 | `ba` | REJECTED | Starts with `b` |

---

### Example 6: Strings Ending with 'ab'

**Manual Setup:**

**Configuration:**
```
States: q0, q1, q2, q3*
Input Alphabet: a, b
Stack Alphabet: Z0
```

**Transitions (add manually):**
```
δ(q0, a, Z0) → (q1, Z0)
δ(q0, b, Z0) → (q0, Z0)
δ(q1, a, Z0) → (q1, Z0)
δ(q1, b, Z0) → (q2, Z0)
δ(q2, a, Z0) → (q1, Z0)
δ(q2, b, Z0) → (q0, Z0)
δ(q2, ε, Z0) → (q3, ε)
```

**Test Strings:**

| # | Input | Expected | Notes |
|---|-------|----------|-------|
| 1 | `baab` | ACCEPTED | Ends with `ab` |
| 2 | `ab` | ACCEPTED | Just `ab` |
| 3 | `aaab` | ACCEPTED | Ends with `ab` |
| 4 | `aba` | REJECTED | Ends with `a` |
| 5 | `ba` | REJECTED | Ends with `a` |

---

### Example 7: a*b* Language (a's then b's, any count)

**Manual Setup:**

**Configuration:**
```
States: q0, q1, q2*
Input Alphabet: a, b
Stack Alphabet: Z0
```

**Transitions (add manually):**
```
δ(q0, a, Z0) → (q0, Z0)
δ(q0, b, Z0) → (q1, Z0)
δ(q1, b, Z0) → (q1, Z0)
δ(q1, ε, Z0) → (q2, ε)
```

**Test Strings:**

| # | Input | Expected | Notes |
|---|-------|----------|-------|
| 1 | `aaabbb` |ACCEPTED | a's then b's |
| 2 | `ab` |ACCEPTED | One each |
| 3 | `aaa` |ACCEPTED | Only a's |
| 4 | `bbb` |ACCEPTED | Only b's |
| 5 | `ε` |ACCEPTED | Empty string |
| 6 | `abab` |REJECTED | Mixed order |
| 7 | `ba` | REJECTED | b before a |

---

### Example 8: Equal 0's and 1's

**Manual Setup:**

**Configuration:**
```
States: q0, q1, q2*
Input Alphabet: 0, 1
Stack Alphabet: Z0, A, B
```

**Transitions (add manually):**
```
δ(q0, 0, Z0) → (q0, AZ0)
δ(q0, 0, B)  → (q0, ε)
δ(q0, 1, Z0) → (q0, BZ0)
δ(q0, 1, A)  → (q0, ε)
δ(q0, ε, Z0) → (q2, ε)
```

**Test Strings:**

| # | Input | Expected | Notes |
|---|-------|----------|-------|
| 1 | `0011` |  ACCEPTED | 2 zeros, 2 ones |
| 2 | `01` |  ACCEPTED | 1 zero, 1 one |
| 3 | `0101` |  ACCEPTED | 2 zeros, 2 ones |
| 4 | `001` |  REJECTED | More 0's |
| 5 | `011` |  REJECTED | More 1's |

---

## 🎯 Practice Exercises

Try creating these PDAs yourself:

### Exercise 1: Divisible by 3
Create a PDA that accepts strings where the length is divisible by 3.

**Hint:** Use 3 states in a cycle.

---

### Exercise 2: At Least 2 a's
Create a PDA that accepts strings containing at least 2 a's.

**Hint:** Count a's with states.

---

### Exercise 3: Binary Strings with Even Parity
Create a PDA that accepts binary strings with an even number of 1's.

**Hint:** Use stack to track parity.

---

## 📋 Quick Reference Card

### Transition Format
```
From State | Read | Pop | Push | To State
-----------|------|-----|------|----------
q0         | a    | Z0  | AZ0  | q0
```

### Common Patterns

| Pattern | States | Stack Usage |
|---------|--------|-------------|
| Counting | Multiple states | Minimal stack |
| Matching | 2-3 states | Push/pop pairs |
| Palindrome | 3 states | Mirror with stack |
| Balanced | 2-3 states | Push open, pop close |

### Symbols Reference

| Symbol | Meaning |
|--------|---------|
| `ε` | Epsilon (empty/nothing) |
| `Z0` | Bottom of stack marker |
| `*` | Marks accept state |
| `δ` | Transition function |

---

## 🔍 Testing Checklist

When testing any PDA:

- [ ] Configuration saved (clicked "Update Configuration")
- [ ] Transitions added and visible in list
- [ ] Test string entered correctly
- [ ] Canvas shows correct state names
- [ ] Click ▶ Play and watch simulation
- [ ] Check Step Log for details
- [ ] Verify result matches expected

---

**Happy Testing! 🎓**

For usage instructions, see **[README.md](./README.md)**
