---
title: Scribbles-1 Basics of OCaml
pubDate: 2026-1-31
categories: []
description: ""
slug: scribbles-1-basics-of-ocaml
draft: true
---

## The properties of OCaml

[First-Class Citizens](https://en.wikipedia.org/wiki/First-class_citizen)

> OCaml is a _statically-typed_ and _type-safe_ programming language.
>
> - A statically-typed language detects type errors at compile time; if a type error is detected, the language won’t allow execution of the program.
> - A type-safe language limits which kinds of operations can be performed on which kinds of data.
>   Python is type-safe but _dynamically typed_. That is, type errors are caught only at run time. C and C++, are statically typed but not type safe: they check for some type errors, but don’t guarantee the absence of all type errors. That is, there’s no guarantee that a type error won’t occur at run time.

C++ is not totally type safe. `malloc/free` will return pointer of `void *`

```cpp
int x = 10;
char* p = reinterpret_cast<char*>(&x);
```

- Algebraic data types
- **[[Type inference]]**: we have to ensure the program is correctly written for the compiler to do type inference. You can annotate types but cannot cast them.
  `(5 : int)` `(5. : int)`
- Parametric polymorphism: functions and data structures can be parameterized over types, functioning like the `template<typename T>` in C++. But C++ templates are (mostly) instantiated and type-checked **per use**, while OCaml’s polymorphic functions are type-checked **once at definition**. In C++, a template definition can be accepted even if some operations inside it would be ill-formed for certain `T`; errors typically appear only when C++ makes an instantiation with a specific type substitution and it is incompatible with the template, so the runtime is good while compilation is slow. OCaml compilation directly does type-checking at the definition, to ensure the template to be a general, abstract type (it must holds for every type, so type-specific operations like `+1` fails right away), then does the substitution at run time. So OCaml is **value agnostic**. <font color="#4bacc6">The check is supported by Hindley–Milner style type inference/unification.</font>
- Garbage collection
- Modules

## OCaml Basics

- **Syntax**
- **Semantics**
  1. **type-checking rules** (static semantics): produce a type or fail with an error
  2. **evaluation rules** (dynamic semantics)
     OCaml does type-checking at compile time like Java and C++, while Python at runtime.

Compile a file, run and clear

```shell
ocamlc - o hello.byte hello.ml
./hello.byte
rm hello.byte hello.cmi hello.cmo
```

Or use dune at ease
`dune`: `(executable (name hello))`
`dune-project`: `(lang dune 3.21)`

```shell
dune build hello.exe
_build/default/hello.exe
dune exec ./hello.exe
dune clean
```

```shell
dune init project auto_hello
cd auto_hello
dune exec bin/main.exe
```

OCaml's toplevel is called _utop_ as a **calculator+command-line interface** (utop is so luxury, even with tab completion and syntax highlighting), some other languages call the toplevel a REPL. Like JShell for Java and interactive interpreter for Python. It's working logic is Read-Eval-Print Loop.
Typically when we write OCaml in a `.ml` file we don't need `;;`. It's only needed when we write in a interactive session like utop. The toplevel reads until hitting one `;;` to know that OK this is one chunk of input (_**a toplevel phrase**_). So `;;` means where phrase is complete and ready for parsing and evaluation.

```ocaml
#quit;; (* quitting utop. start with another "#" *)
42;;
(* - : int = 42 *)
```

### Expression

OCaml integers are represented as 63 bits, using one bit in the 64-bit word as a mark of integer (distinguishing from pointer, which is for garbage collection) (previously it's 31 bits).
OCaml floats are float64. Syntactically, they must always contain a dot and the addition, division and multiplication of floats must also has a dot `+.` `/.` `*.` .
Char takes 1 byte. String is sequence of chars. OCaml values don't have methods like C++ to convert themselves to strings, but we can use `string_of_xxx`.
operator `lsr` is logical shift right, while `asr` is arithmetic shif right. `asr` fills the left with sign bit while `lsr` fills with 0s.

```ocaml
3.14 *. (float_of_int 2);;
(* - : float = 6.28 *)
(int_of_float 3.14) * 2;;
(* - : int = 6 *)
char_of_int(5);;
(* - : char = '\005' *)
int_of_char('t');;
(* - : int = 116 *)
string_of_float(3.33);;
(* - : string = "3.33" *)
"abcd".[0];;
(* - : char = 'a' *)
-40 lsr 2;;
(* - : int = 2305843009213693942 *)
-40 asr 2;;
(* - : int = -10 *)
2305843009213693942 lsl 2;;
(* - : int = -40 *)
"str" ^ "ing";;
(* - : string = "string" *)
[2,3];;
(* - : (int * int) list = [(2, 3)] *) (* list of pairs *)
[1,2] @ [3,4];;
(* - : (int * int) list = [(1, 2); (3, 4)] *)
```

OCaml also has references. They are expressions but they simulates the behavior of variables (<font color="#f79646">Everything is an expression</font> in OCaml). `ref 0` is an expression, it evaluates to return a value with type `int ref`. `!r` is also an expression, it evalutes to the content referred. `r:=5` is assigning value to the reference, and it's also an expression, it evaluates to a value `()` with type `unit`.

```ocaml
let r = ref 0;;
(* val r : int ref = {contents = 0} *)
!r;;
(* - : int = 0 *)
r := 1;;
(* - : unit = () *)
let x = if (r:=5; !r > 0) then "hello" else "bye";;
(* val x : string = "hello" *)
```

Structural Equality `=` (inequality `<>`) is for value comparison, which ignores the memory address, like `==` in python, while physical equality `==` (inequality `!=`) compaires memory address, like `==` between pointers in C/C++.

```ocaml
let r1 = ref 42;;
(* val r1 : int ref = {contents = 42} *)
let r2 = ref 42;;
(* val r2 : int ref = {contents = 42} *)
r1 = r2;;
(* - : bool = true *)
!r1 = !r2;;
(* - : bool = true *)
r1 == r2;;
(* - : bool = false *)
!r1 == !r2;;
(* - : bool = true *)
let r3 = r1;;
(* val r3 : int ref = {contents = 42} *)
r3 == r1;;
(* - : bool = true *)
r3 <> r2;;
(* - : bool = false *)
r3 != r2;;
(* - : bool = true *)
```

With regard to why `!r1 == !r2` is true, OCaml implements a "small integer optimization" ==using **tagged pointers** to store immediate integer values directly in a single machine word without requiring extra memory allocation (boxing)==.
If we use this experiment to heap objects, like floats or lists, it will be `false` because their addresses are different.

```ocaml
let x = ref 3.14;;
(* val x : float ref = {contents = 3.14} *)
let y = ref 3.14;;
(* val y : float ref = {contents = 3.14} *)
!x == !y;;
(* - : bool = false *)
!x != !y;;
(* - : bool = true *)
```

It seems that even large integers also has `==` to be true. That's amasing.

If assertion is true, OCaml returns a value of type unit

```ocaml
assert (1 == 1);;
(* - : unit = () *)
assert (1 == 2);;
(* Exception:
Assert_failure ("//toplevel//", 1, 0). *)
```

When there is no `else` the default empty expression is `()`, so the type-checking fails if there is no `else` and the `then` branch'es type is not unit.

```ocaml
if 3 + 5 > 2 then "yay!" else "boo!";;
(* - : string = "yay!" *)
if 'a' > 'b' then ();;
(* - : unit = () *)
if 'a' > 'b' then 2;;
(* Error: The constant 2 has type int
       but an expression was expected of type
         unit
       because it is in the result of a conditional with no else branch *)
```

The principle of name irrelavance: like $f(x)=x^2$ and $f(y )=y^2$, the name doesn't matter! so we just evaluate the expression according to the priority of parenthenses.
<font color="#ff0000">Rule: a new binding of a variable _shadows_ any old binding. </font> It’s as if the new binding temporarily casts a shadow over the old binding. But eventually the old binding could reappear as the shadow recedes.of the variable name.

```ocaml
let x = 5 in
  ((let x = 6 in x) + x);;
(* - : int = 11 *)
```

<font color="#ff0000">Shadowing is not mutable assignment.</font> In the following example, each `let` definition binds an entirely new variable. <font color="#f79646">If that new variable happens to have the same name as an old variable, the new variable temporarily shadows the old one.</font> But the old variable is still around, and its value is immutable.

```ocaml
let x = 42;;
(* val x : int = 42 *)
let f y = x + y;;
(* val f : int -> int = <fun> *)
f 0;;
(* : int = 42 *)
let x = 22;;
(* val x : int = 22 *)
f 0;;
(* - : int = 42  (* x did not mutate! *) *)
```

OCaml has objects besides values like integers, tuples, lists, records, variants. Object oriented programming (OOP) in OCaml is available but rarely used. OOP organizes data (members and attributes) as objects and describes the object's behavior (methods or functions).

### **Definition**

```ocaml
let x = 42;;
(* val x: int = 42 *)
```

**Definitions are not expressions**, nor are expressions definitions. But definitions can have expressions in the syntax.
`x` is an identifier, which should starts with a lower-case letter.
`let x = e`
Evaluation:

- evaluate expression `e` to a value `v`
- bind `v` to `x` (a memory named `x` contains `v`)

### **Function**

##### Auto type inference

We don't have to write types because the compiler does type inference according to the code itself. (But we can do annotations.)

```ocaml
let increment x = x + 1;;
(* val increment : int -> int = <fun> *)
let rec fact n = if n = 0 then 1 else n * fact (n - 1);;
(* val fact : int -> int = <fun> *)
let rec pow (x : int) (y : int) : int = if y = 0 then 1 else x * pow x (y-1);;
```

##### First-class functions

Functions are first-class citizens, having identifier `increment`, and type `int -> int`, and value as the function itself (utop prints `<fun>` as a placeholder).
[[Notes from 1024th]]

```ocaml
let x = 1;;
(* val x : int = 1 *)
let f y = x + y;;
(* val f : int -> int = <fun> *)
let res1 = f 2 in (
    let x = 5 in (
    let res2 = f 2 in res1 + 10 * res2
  )
);;
(* Line 2, characters 8-9:
Warning 26 [unused-var]: unused variable x.

- : int = 33 *)
```

`f` is a **metavariable** indicating an identifier being used as a function name, and parameters `x` are metavariables indicating argument identifiers.
These identifiers must begin with a lowercase letter.
When a function is defined, OCaml records that the name `f` is bounded to a function with the given arguments.
OCaml functions don't have to have names. We can write a function `fun x -> x+1` as a "value" just like we write a number `42` (and this is also called lambda expression). The `let` function definition is not an expression.

```ocaml
let f1 x = x in (
let f2 x = x in (
f1 = f2 )
);;
(* Exception: Invalid_argument "compare: functional value". *)

let f1 x = x in (
let f2 x = x in (
f1 == f2 )
);;
(* - : bool = false *)

let f1 x = x in (
let f2 = f1 in (
f1 == f2 )
);;
(* - : bool = true *)
```

<font color="#a5a5a5">`f1` 和 `f2` 都是函数（而且各自是不同的闭包值），OCaml 没有定义“两个函数是否相等”的通用语义：</font>
<font color="#a5a5a5">- 扩展性问题：就算它们对所有输入返回一样（外延相等），一般也无法在有限时间内判定。</font>
<font color="#a5a5a5">- 语义问题：闭包还可能捕获环境，是否“相等”也不清晰。 </font>
<font color="#a5a5a5"> 因此 OCaml 直接禁止用通用 `=` 去比函数，并在运行时报错。<font color="#bfbfbf">(AIGC)</font></font>[https://ocaml.org/docs/values-and-functions](https://ocaml.org/docs/values-and-functions)

<font color="#a5a5a5">Now you have a taste of functions as first-class citizen. Higher-order programming is “more expressive for higher-order abstractions (callbacks, combinators, map/filter-style APIs) because passing behavior as a value is direct" <font color="#bfbfbf">(AIGC)</font></font>.[train_rse.ox](https://train.rse.ox.ac.uk/material/HPCu/software_architecture_and_design/functional/higher_order_functions_python)

##### Shadowing and scopes

```ocaml
let f x y = x + y;;
(* val f : int -> int -> int = <fun> *)
let f x y = x * y;;
(* val f : int -> int -> int = <fun> *)
f 3 3;;
(* - : int = 9 *)
```

This not mutable, just shadowing. When you write two functions with the same name, the latter one shadows the former one. And with `let ... in` and `(...)` to handle with scope, we can go beyond the shadowed scope and call the former one. (That's 1024th's example.) My experiments:

```ocaml
let n = 10;;
(* val n : int = 10 *)

let f x = x + n;;
(* val f : int -> int = <fun> *)
f 5;;
(* - : int = 15 *)

let n = 20;;
(* val n : int = 20 *)

f 5;;
(* - : int = 15 *)

let f x= x + 3*n;;
(* val f : int -> int = <fun> *)
f 5;;
(* - : int = 65 *)
```

An example from 1024th:

```ocaml
let f x y = x + y in
let () =
(
  let f x y = x * y in
  Printf.printf "%d\n" (f 3 3)
) in
Printf.printf "%d" (f 3 3);;
(* 9
6- : unit = () *)
```

##### Mutually recursive functions

> <font color="#f79646">Mutually recursive functions</font>: sometimes functions are mutually recursive, meaning that calls form a circle, where one function calls another which calls the first, with any number of calls in between.

```ocaml
let rec even n =
  n = 0 || odd (n - 1)
and odd n =
  n <> 0 && even (n - 1);;
(* val even : int -> bool = <fun>
val odd : int -> bool = <fun> *)
```

##### Static and dynamic semantics

For functions with more than one arguments, they have `t1 -> t2 -> u` as the type, meaning requiring two inputs, the first of type `t1` and the second of type `t2`, and returns an output of type `u`.

```ocaml
let f1 x y = x ^ y;;
(* val f1 : string -> string -> string = <fun> *)
```

**Static semantics**: `e0 : t1 -> ... -> tn -> u`, then `e1 : t1` and .... `e0 e1 ... en: u`.
**Dynamic semantics**:

> To evaluate `e0 e1 ... en`:
>
> 1. Evaluate `e0` to a function. Also evaluate the argument expressions `e1` through `en` to values `v1` through `vn`.
>    For `e0`, the result might be an anonymous function `fun x1 ... xn -> e` or a name `f`. In the latter case, we need to find the definition of `f`, which we can assume to be of the form `let rec f x1 ... xn = e`. Either way, we now know the argument names `x1` through `xn` and the body `e`.
> 2. Substitute each value `vi` for the corresponding argument name `xi` in the body `e` of the function. That substitution results in a new expression `e'`.
> 3. Evaluate `e'` to a value `v`, which is the result of evaluating `e0 e1 ... en`.
>    If you compare these evaluation rules to the rules for `let` expressions, you will notice they both involve <font color="#f79646">substitution</font>. This is not an accident. In fact, anywhere `let x = e1 in e2` appears in a program, we could replace it with `(fun x -> e2) e1`. They are syntactically different but semantically equivalent. In essence, <font color="#f79646">`let` expressions are just syntactic sugar for anonymous function application</font>.

##### <font color="#ff0000">Polymorphism</font>

And when the functions without annotations can be adapted to multiple types, it will be written as a an unknown type `'a`. And you can assign this function to another function with type specified.

> We took a value of type `'a -> 'a`, and we bound it to a name whose type was manually specified as being `int -> int`. This assignment is possible because it doesn't break the promise of `id` or the anonymous `fun x -> x`, it just loses some information. It’s always going to be <font color="#f79646">safe</font> to use a function of type `'a -> 'a` when what we needed was a function of type `int -> int`.

```ocaml
let id x = x;;
(* val id : 'a -> 'a = <fun> *)

let id2 : 'a -> 'a = fun x -> x;;
(* val id2 : 'a -> 'a = <fun> (* manually annotate to a general type *) *)

let id_int : int -> int = id;;
(* val id_int : int -> int = <fun> *)

let id_bool : bool -> bool = fun x -> x;;
(* val id_bool : bool -> bool = <fun> *)

let first x y = x;;
(* val first : 'a -> 'b -> 'a = <fun> *)

let first_int : int -> 'a -> int = first;;
(* val first_int : int -> 'a -> int = <fun> *)

let first_str : string -> 'a -> int = first;;
(* Error: The value first has type
         string -> 'a -> string
       but an expression was expected of type
         string -> 'a -> int
       Type string is not compatible with type int *)
```

##### Labelled arguments

You can also lable the arguments with `~name:`

```ocaml
let first_str : string -> 'a -> int = first;;
(* Error: The value first has type
         string -> 'a -> string
       but an expression was expected of type
         string -> 'a -> int
       Type string is not compatible with type int *)

let sum ~lchild:x ~rchild:y = x + y;;
(* val sum : lchild:int -> rchild:int -> int = <fun> *)

sum 7 8;;
(* Without specifying the names, there will be warnings *)
(* Line 1, characters 0-3:
Warning 6 [labels-omitted]: labels lchild, rchild were omitted in the application of this function.

Line 1, characters 0-3:
Warning 6 [labels-omitted]: labels lchild, rchild were omitted in the application of this function.

- : int = 15 *)

sum ~lchild:4 ~rchild:5;;
(* - : int = 9 *)

let echo ~str:(x : string) = x;;
(* val echo : str:string -> string = <fun> *)
```

##### Optional arguments

Optional argument with default value. Then the name of the optional argument cannot be skipped.

```ocaml
 let step ?default_arg: (x=1) y = x + y;;
(* val step : ?default_arg:int -> int -> int = <fun> *)

step 2 0;;
(* Error: The function applied to this argument has type
         ?default_arg:int -> int
This argument cannot be applied without label *)

step ~default_arg:2 0;;
(* - : int = 2 *)
step 0;;
(* - : int = 1 *)
```

##### Partial application

OCaml allows partial application.

```ocaml
let add x = fun y -> x + y;;
(* val add : int -> int -> int = <fun>
   (* Semantically equivalent to `let add x y = x + y` *)
   (* Also equivalent to `let add = fun x -> (fun y -> x + y)` *) *)
addx 5;;
(* - : int -> int = <fun> *)
```

##### Functiona Associativity

<font color="#ff0000", size = "5pt">Every OCaml function takes exactly one argument.</font>
Even though you think of `f` as a function that takes `n` arguments, in reality it is a function that takes 1 argument and returns a function. The type of a function should be `t1 -> (t2 -> (t3 -> t4))`, which is, function types are <font color="#f79646">right associative</font>: there are implicit parentheses around function types, from right to left. The intuition here is that a function takes a single argument and returns a new function that expects the remaining arguments.
Function application, on the other hand, is <font color="#f79646">left associative</font>, where `e1 e2 e3 e4` is acutally `((e1 e2) e3) e4`.

##### Define new operators

Built-in infix operators are acutally implemented as functions.

```ocaml
let ( ^^ ) x y = max x y
```

##### Pipelines

```ocaml
let inc x = x + 1;;
(* val inc : int -> int = <fun> *)
let square x = x * x;;
(* val square : int -> int = <fun> *)
inc (square 6);;
(* - : int = 37 *)
6 |> square |> inc;;
(* - : int = 37 *)
```

##### Tail-call optimization

OCaml also implement function calls in a stack.

```ocaml
let rec count n =
  if n = 0 then 0 else 1 + count (n - 1);;

let rec count_aux n acc =
  if n = 0 then acc else count_aux (n - 1) (acc + 1);;
let count_tr n = count_aux n 0;; (* tr for tail recursion *)
```

> A good compiler (and the OCaml compiler is good this way) can notice when a recursive call is in _tail position_,<font color="#f79646"> which is a technical way of saying “there’s no more computation to be done after it returns”.</font> **A recursive call in tail position does not need a new stack frame. It can just reuse the existing stack frame.** That’s because there’s nothing left of use in the existing stack frame. None of that memory ever needs to be read again, because that call is effectively already finished.
> This is the _tail-call optimization_. It can even be applied in cases beyond recursive functions if <font color="#f79646">the calling function’s stack frame is suitably compatible with the callee.</font> > **The Recipe for Tail Recursion.** In a nutshell, here’s how we made a function be tail recursive:
>
> 1. Change the function into a helper function. Add an extra argument: the accumulator, often named `acc`.
> 2. Write a new “main” version of the function that calls the helper. It passes the original base case’s return value as the initial value of the accumulator.
> 3. Change the helper function to return the accumulator in the base case.
> 4. Change the helper function’s recursive case. It now needs to do the extra work on the accumulator argument, before the recursive call. This is the only step that requires much ingenuity.

### Directives

```ocaml
#use "somefile.ml";; (* in order to load codes in toplevel *)
```

Exit utop when you want to edit the code in the `#use` file, because utop runs a single-thread, reloading might cause type-checking error or memory leak.

### Documentation

todo

### Lists

OCaml list is a sequence of values with the same type, implemented as singly-linked lists. (Suprising name! Yes, linked list: singly linked lists and doubly linked lists).
So their implementation is good for sequential access.
`[e1; e2]` is syntatic sugar for `e1 :: e2 :: []`, consing elements to the nil.
Cons is a right associative operator.
`[]` is a value. To evaluate `e1 :: e2`, we first evaluate `e1` to be value `v1`, and evaluated `e2` to be a list value `v2`, and then return a **new** list value `v1 :: v2`. So the cons will have the same list type of `e2`, and require the prepended element to have type the same as the list elements in `e2`. If the elements in the list are type `t`, then the list will be `t list`.
Lists are first-class citizens. They are immutable. so the `::` doesn't change the list, it creates a new one by prepending.
Immutability it safe for the compiler to perform an optimization. Two lists, if one derived from another, can share some of the memory for optimization and do this safely because they both don't change.

_**Compare:**_
Cons `::` does prepend `'a -> 'a list -> 'a list`. Constant time.
Append `@` does combination `'a list-> 'a list -> 'a list`. Linear time of the first list.

```ocaml
[];; (* `[]` type is not determined, `[]` pronounced as nil *)
(* - : 'a list = [] *)
[1];;
(* - : int list =  *)
[1; 2];;
(* - : int list = [1; 2] *)
[1; 1.];;
(* Error: The constant 1. has type float
       but an expression was expected of type int *)
[[1];[2]];;
(* - : int list list = [; ] *)
1 :: 2 :: [];; (* pronounced as cons*)
(* - : int list = [1; 2] *)
"red" :: ["blue"; "green"];;
(* - : string list = ["red"; "blue"; "green"] *)
```

##### Pattern Matching

```ocaml
match not true with | true -> "nope" | false -> "yep";;
(* - : string = "yep" *)

let y = match 42 with foo -> foo;;
(* val y : int = 42 *)

let z = match "hello" with | "foo" -> 1 | _ -> 2;;
(* val z : int = 2 *)

let a = match [] with | [] -> "empty" | _ -> "not empty";;
(* val a : string = "empty" *)

let b = match ["111"; "222"] with | [] -> "empty list" | head :: tail -> head;;
(* val b : string = "111" *)

let b = match ["111"; "222"] with | [] -> ["empty list"] | head :: tail -> head;;
(* Error: The value head has type string
       but an expression was expected of type
         string list *)

let first3 t =
 match t with | (a, b, c) -> a;;
(* val first3 : 'a * 'b * 'c -> 'a = <fun> *)

first3 (1, 2, 3);;
(* - : int = 1 *)

fst (1, 2);;
(* - : int = 1 *)

type student = {
 name : string;
 year: int;
}

let rgb = {
 name = "ruth";
 year = 1111;
}

let name_with_year s = match s with
 | {name; year} -> name ^ " " ^ string_of_int year;;
(* type student = { name : string; year : int; }
val rgb : student =
  {name = "ruth"; year = 1111}
val name_with_year : student -> string = <fun> *)

name_with_year rgb;;
(* - : string = "ruth 1111" *)

let test lst = (* let empty lst = (lst = []) *)
    match lst with
    | [] -> true
    | h :: t -> false;;
(* val test : 'a list -> bool = <fun> *)

test [];;
(* - : bool = true *)
test ["aimme"; "cat"];;
(* - : bool = false *)

let test lst =
    match lst with
    | [] -> true
    | _ :: _ -> false;;
(* val test : 'a list -> bool = <fun> *)

let rec sum lst =
    match lst with
    | [] -> 0
    | h :: t -> h + sum t;;
(* val sum : int list -> int = <fun> *)

sum [1; 2; 3; 4; 5];;
(* - : int = 15 *)

#trace sum;;
(* sum is now traced. *)

sum [1; 2; 3;];;
(* sum <-- [1; 2; 3]
sum <-- [2; 3]
sum <-- [3]
sum <-- []
sum --> 0
sum --> 3
sum --> 5
sum --> 6
- : int = 6 *)

#untrace sum;;
(* sum is no longer traced. *)

let rec append lst1 lst2 =
    match lst1 with
    | [] -> lst2
    | h :: t -> h :: append t lst2;;
(* val append : 'a list -> 'a list -> 'a list =
  <fun> *)

append [1; 2] [3; 4; 5];;
(* - : int list = [1; 2; 3; 4; 5] *)
append [1; 2] [];;
(* - : int list = [1; 2] *)

[1; 2] @ [3; 4];;
(* - : int list = [1; 2; 3; 4] *)

List.hd [1.; 2.; 3.;];;
(* - : float = 1. *)
List.tl [1.; 2.; 3.;];;
(* - : float list = [2.; 3.] *)
List.hd [];;
(* Exception: Failure "hd". (* pattern matching is more robust, handling with empty list. *) *)
```

Like switch statement in C++, but more powerful.
Match with some **shapes** of data, and then extract pieces from the data.
Lists are not mutable. Immutable.

Syntacs: here `p`<font color="#f79646"> is pattern expressions</font> (like any identifier, `_`, any constant value, `[]`, `p1 :: p2`, `(p1, p2)`, `{f1=p1; f2=p2}`)

```ocaml
match e with
| p1 -> e1
| p2 -> e2
```

**Semantics (evaluation)**:
First evaluate `e` to `v`, and find the first pattern `pi` (top to bottom) that matches `v`, then evaluate `ei` to `vi` and return `vi`.
_**Patterns**_: A constant matches itself. <font color="#f79646">An identifier matches anything and binds itself (the name) with the matched value in the scope of the branch. </font>The underscore matches anything and doesn't bind.

> - If `p1` matches `v1` and produces a set of bindings, and if `p2` matches `v2` and produces a set of bindings, then `p1 :: p2` matches `v1 :: v2` and produces the union set of bindings. Note that `v2` must be a list (since it’s on the right-hand side of `::`) and could have any length. Note that the union of bindings will never have a problem where the same variable is bound separately in two bindings and because of <font color="#f79646">the syntactic restriction that no variable name may appear more than once in a pattern. </font>
> - If for all `i` in `1..n`, it holds that `pi` matches `vi` and produces the set of bindings, then `[p1; ...; pn]` matches `[v1; ...; vn]` and produces a set of bindings. Note that this pattern specifies the exact length the list must be.

Type-checking (static): all of the patterns and the value that will be matched should the same type. All the expressions in branches should have the same type, and this will be the type of the entire match expression.
And the compiler also tests _**exhaustiveness/exhaustivity**_ and _**unused branches**_.

```ocaml
let bad_test lst =
    match lst with
    | [] -> "empty";;

(* Lines 2-3, characters 4-19:
Warning 8 [partial-match]: this pattern-matching is not exhaustive.
Here is an example of a case that is not matched:
_::_

val bad_test : 'a list -> string = <fun> *)

let rec sum lst =
  match lst with
  | h :: t -> h + sum t
  | [ h ] -> h
  | [] -> 0;;
(* Line 4, characters 4-9:
Warning 11 [redundant-case]: this match case is unused.

val sum : int list -> int = <fun> *)

(* A silly example where the programmer thought the code will check whether n is equal to n. But pattern matching is not checking equality, it matches an identifer pattern with `n`, so it will be always true. Therefore the second branch is unused.*)
let length_is lst n =
  match List.length lst with
  | n -> true
  | _ -> false;;
(* Line 4, characters 4-5:
Warning 11 [redundant-case]: this match case is unused.

val length_is : 'a list -> 'b -> bool = <fun> *)
```

> - `_ :: []` matches all lists with exactly one element
> - `_ :: _` matches all lists with at least one element
> - `_ :: _ :: []` matches all lists with exactly two elements
> - `_ :: _ :: _ :: _` matches all lists with at least three elements

##### Syntatic sugar for function keyword

We can skip the last argument and the `match with` thing if we are doing a pattern matching for the last argument. So here is a rewriting of `sum`.

```ocaml
let f x y z = match z with
    | [] -> x + y
    | _ -> 0;;
(* val f : int -> int -> 'a list -> int = <fun> *)
let f1 x y = function
    | [] -> x + y
    | _ -> 0;;
(* val f1 : int -> int -> 'a list -> int = <fun> *)
f 2 3 [];;
(* - : int = 5 *)
f1 2 3 [];;
(* - : int = 5 *)

let rec sum = function
    | [] -> 0
    | h :: t -> h + sum t;;
(* val sum : int list -> int = <fun> *)
sum [2; 3];;
(* - : int = 5 *)
```
