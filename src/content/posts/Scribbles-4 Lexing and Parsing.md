---
title: Scribbles-3 Induction and Recursiveness
pubDate: 2026-4-16
categories: []
description: ""
slug: scribbles-4-lexing-parsing
---

These are also some random scribbles for preparing the discussion section. I suddenly realize that we didn't learn the principle of lexing and parsing during undergrad but directy played with implementations.

### Lexer

Lexer is a deterministic finite automata with a collection of regular expressions to describe tokens. A lexer takes code files as input and tries character by character to recognize the patterns as tokens.

### Parser

Parser for context-free languages is built on pushdown automaton, because "every context-free grammar can be transformed into an equivalent nondeterministic pushdown automaton". Intuitively, the key component that distinguishes a PDA from a finite automaton is a stack; this stack is ideally suited for handling nested structures within grammar—such as matching parentheses, nested expressions, and recursive syntactic elements.

**Todo: context-free-languages**

> A� **pushdown automaton**� (**PDA**) is a type of� automaton� that employs a� stack. Given an input symbol, current state, and stack symbol, the automaton can follow a transition to another state, and optionally manipulate (push or pop) the stack. If, in every situation, at most one such transition action is possible, then the automaton is called a deterministic pushdown automaton (DPDA). In general, if several actions are possible, then the automaton is called a general, or nondeterministic, PDA.
> They are more capable than finite-state machines but only computationally equivalent to a "restricted" Turing Machine (TM) with two tapes, where the first tape is read-only input tape and the second one is stack tape with only "front,pop and push". If there is another stack tape to keep the popped data instead of losing it, such a 3-tape TM is as capable as a standard one.
> (rephrased from [wiki](https://en.wikipedia.org/wiki/Pushdown_automaton#Turing_machines))

<font color="#7f7f7f">But I think the wiki's description of "restricted TM" is a bit wierd. The sentence "� i.e., the TM can read, write, and move left and right on the second tape, with the restriction that the only action it can perform at each step is to either delete the left-most character in the string (pop) or add an extra character left to the left-most character in the string (push)" sounds like a "restricted TM" can read any position on the second tape. I believe it can only access the front of the stack.</font>

### � Backus-Naur form

BNF describes how to form syntactically valid sequences. It consists a set of terminal symbools, a set of non-terminal symbols and derivation rules. All symbols are from a finite, nonempty set called alphabet. **Terminal symbols** are fixed symbols that cannot be replaced by other symbols of the alphabet. **Nonterminal symbols are symbols** that can be replaced by other symbols of the alphabet by the production rules under the same formal grammar, like<font color="#f79646"> categories or variables</font>.

> A derivation rule is written in the format:� `<symbol>� ::= __expression__`, where: `<symbol>` is a non-terminal symbol, identifying the category to be replaced, `::=` is a metasymbol meaning "is replaced by," `__expression__` is the replacement, consisting of one or more sequences of symbols—either terminal symbols (e.g., literal text like "Sr." or ",") or non-terminal symbols (e.g., `<last-name>`) — with options separated by a vertical bar (|) to indicate alternatives.

Context-free grammars� are those grammars in which the left-hand side of each production rule consists of only a single nonterminal symbol.

### Compilation

Happy to go over this high-level structure of compilers after 3 years.

Compiler takes a source program expressed in high-level language, and "translate" it into target program in loww-level language like MIPS or x86 assembly. Then the OS loads and executes the target program. While interpreter directly executes the program itself. So the OS loads and executes the interpreter, and the interpreter runs the program.

Virtual machines does a mixture of imterpretation and compilation. A compiler translates the source code into some bytecode then interpreted by the virtual machine. And virtual machines use just-in-time compilation (JIT) to optimize performace by automatically making frequently interpreted code into assembly.

In **lexing**, the compiler transforms the source code into a sequence of tokens by grouping the characters together.

In **parsing**, the compiler transforms the sequence of tokens into abstract syntax tree (AST). It should include some semantic analysis like collecting symbols in scopes. Identifiers in different scopes form stacks (shadowing), each "stack block" is like a map.

Then the compiler does **semantic analysis** like type checking.

> Type checking typically requires producing a data structure called a� *symbol table*� that maps identifiers (e.g., variable names) to their types. As a new scope is entered, the symbol table is extended with new bindings that might shadow old bindings; and as the scope is exited, the new bindings are removed, thus restoring the old bindings. So a symbol table blends features of a dictionary and a stack data structure. (from [textbook of sp2021](https://courses.cs.cornell.edu/cs3110/2021sp/textbook/interp/intro.html))

Besides type check, the OCaml compiler also verifies and warns if some input cases are missing, and if a branch can never be used because an earlier branch already covers it. Though the clauses are considered in order, the compiler may also speed up the decision process as long as it preserves the property that first matching case wins. [Further reading](http://moscova.inria.fr/~maranget/papers/warn/index.html)

The next step is to generate intermediate representation (**IR**). Unlike assembly committing to specific architectural rules, IR is machine independent. It has abstract instructions for machine, like load and store, call and return, but still keeps its own type system and simply assumes that the machine has unbounded registers. IR still keeps some structure (like graph/basic blocks/SSA) which makes it more friendly than assembly to do optimization like constant propagation analysis and dead code elimination.

The final **code generation** transofrms IR into machine instructions. It does memory and register allocation, which was really hard for me to do three years ago because my poor design of IR... [Further](https://jonathan.protzenko.fr/papers/register09.pdf).
