---
title: Scribbles-2 OCaml Types
pubDate: 2026-2-24
categories: []
description: ""
slug: scribbles-2-basics-of-ocaml
---

## Notes on pattern matching

[Patterns that everyone likes](https://ocaml.org/manual/5.4/patterns.html).
The `let` expression is actually doing a pattern matching. Consider the dynamic semantics of `let p = e1 in e2`. We first evaluate `e1` to a value `v1`. The `p` can be any pattern, and we match `v1` with pattern `p`. If they doesn't match, there will be a `Match_failure`, otherwise it matches and generates bindings (emmm perhaps no bindings are produced because I can write super weird `let` in the following). These bindings will be used for substitutions in `e2`, generating another `e2'` and evluates to `v2`.

```ocaml
let 5 = 5 in 6;;

(* Line 1, characters 4-5:
Warning 8 [partial-match]: this pattern-matching is not exhaustive.
Here is an example of a case that is not matched:
0

- : int = 6 *)

let 5 = 8 in 6;;

(* Line 1, characters 4-5:
Warning 8 [partial-match]: this pattern-matching is not exhaustive.
Here is an example of a case that is not matched:
0

Exception: Match_failure ("//toplevel//", 1, 4). *)
```

## Types of OCaml

### Variants

Variants are like enums in C. Variants are **data types**, and the value of expressions in this type is exactly one of the defined values.

```ocaml
type day = Sun | Mon | Tue | Wed | Thu | Fri | Sat
let d = Tue
let int_of_day d =
  match d with
  | Sun -> 1
  | Mon -> 2
  | Tue -> 3
  | Wed -> 4
  | Thu -> 5
  | Fri -> 6
  | Sat -> 7
```

The definition of variants is also shadowing in different scopes.

```ocaml
type t1 = C | D
type t2 = D | E
let x = D
(* val x : t2 = D *)
```

### Records

A record is a composite of other types of data, and forming a new type. The pattern matching `{day; food; amount}` is sugar for `{day = date; food = menu; amount = int}`.

```ocaml
type date = Mon | Tue | Wed| Thu;;
(* type date = Mon | Tue | Wed | Thu *)
type menu = Chicken | Beef | Fish;;
(* type menu = Chicken | Beef | Fish *)
type plan = { day : date; food: menu; amount: int};;
(* type plan = { day : date; food : menu; amount : int; } *)
{day = Mon; food = Beef; amount = 10};;
(* - : plan = {day = Mon; food = Beef; amount = 10} *)
let p = {day = Tue; food = Fish; amount = 1};;
(* val p : plan = {day = Tue; food = Fish; amount = 1} *)
p.food;;
(* - : menu = Fish *)
match p with {day; food; amount} -> amount;;
(* - : int = 1 *)
```

### Tuples

Tuples are a composite of other types of data. But the components are not named, they are identified by position. We can also explicitly write a tuple's type using the syntax `*` (which is actually doing **type synonyms** of already existing types).

```ocaml
(1,"hello",true);;
(* - : int * string * bool = (1, "hello", true) *)
match (1,"hello",true) with (x,y,z) -> (string_of_int x) ^ y ^ (string_of_bool z);;
(* - : string = "1hellotrue" *)
type tup = int * int * bool;;
(* type tup = int * int * bool *)
```

### Tagged union

We can take a union of two types and give it one name, or view one type as a union with two tags. Inside this union, the new tags we design can tell us which subset a value comes from.

```ocaml
type string_or_int =
  | Str of string
  | Int of int

type colored_int =
  | Blue of int
  | Pink of int
```

Then we can discriminate the tagged values even they are the same original type.

```ocaml
let increment_pink = function
  | Blue i -> i
  | Pink i -> i + 1
```

The syntax is like below, `[]` means optional.

```ocaml
type t = C1 [of t1] | ... | Cn [of tn]
```

If a `Ci` is constant, i.e. a tag without different values, then you can write an expression just with `Ci`; else if it's non-constant, like `Ci of string`, then we should write an expression as `Ci e`, e.g. `Ci "hello"`.

The dynamic semantics have one subtle thing: If `t = ... | C of t' | ...`, then any expression of type `t'` also has the variant type `t`, can be viewed as a `C e` expression, i.e. if `e : t'` then `C e : t`.

And in the pattern matching, the non-constant expression is matched by `C p`. Examples can be find in next section (`area` and `center`).

### Algebraic data type

Variants are one-of types, also called <font color="#c0504d">sum types</font>. Records and tuples are each-of types (Cartesian products). also called <font color="#c0504d">product types</font>. Algebraic data types contain both sum types and product types, e.g. the typical example, we first define a pair (each of, product type), then define a tagged union with three tags (one of, sum type), and in some tags, we use the tuple (or pair) again (product type).

```ocaml
type point = float * float
type shape =
  | Point of point
  | Circle of point * float (* center and radius *)
  | Rect of point * point (* lower-left and upper-right corners *)

let area = function
  | Point _ -> 0.0
  | Circle (_, r) -> Float.pi *. (r ** 2.0)
  | Rect ((x1, y1), (x2, y2)) ->
      let w = x2 -. x1 in
      let h = y2 -. y1 in
      w *. h

let center = function
  | Point p -> p
  | Circle (p, _) -> p
  | Rect ((x1, y1), (x2, y2)) -> ((x2 +. x1) /. 2.0, (y2 +. y1) /. 2.0)
```

> In the algebraic data type, "one-of" means the a value of a variant is formed by _one of_ the constructors, while "each-of" means the constructors can have tuples or records, whose value have a sub-value from _each of_ their component types.

The variant type is a collection of constructors. The constructor here serves as both a formation of a value a tag (like a sub-type in this variant type). Variant types are also called tagged unions.

Variant types can be defined recursively by mentioning their own name inside constructors.

```ocaml
type intlist = Nil | Cons of int * intlist
let lst3  = Cons (3, Nil) (* a pair of type int * list *)
let lst123 = Cons (1, Cons (2, Cons (3, Nil)))
```
Types may be mutually recursive if you use the `and` keyword:
```ocaml
type node = {value : int; next : mylist}
and mylist = Nil | Node of node
```
But such mutual recursion must have at least one type that can end, otherwise it will be cyclic and cause an error.
```ocaml
type t = u and u = t
(* File "[12]", line 1, characters 0-10:
1 | type t = u and u = t
    ^^^^^^^^^^
Error: The type abbreviation t is cyclic:
         t = u,
         u = t *)
```

Record type can also be recursive. The textbook give such an example:
```ocaml
type node = {value : int; next : node}
```
But this type is not useful. The only values we can create from this type must refer back to itself in a loop because this recursion doesn't end.
```ocaml
let rec n = {value = 1; {value = 2; {value = 3; n}}}
```
> Remark from 1024th: coinductive

Variant type can have type parameters.
```ocaml
type 'a mylist = Nil | Cons of 'a * 'a mylist
let lst3 = Cons (3, Nil) 
```
If we write functions for such parameterized types, we may want to ensure that the `'a` type annotation can be omitted safely, that is we don't use operations that are specific to some types, like `int` or `string`.<font color="#c0504d"> (polymorphism)</font> Otherwise, we will give up polymorphism by restricting what `'a` can be.

> (directly from book) There’s another kind of variant in OCaml that supports this kind of programming: _polymorphic variants_. Polymorphic variants are just like variants, except:
> 1. You don’t have to declare their `type` or constructors before using them.
> 2. There is no name for a polymorphic variant type. (So another name for this feature could have been “<font color="#4bacc6">anonymous variants</font>”.)
> 3. The constructors of a polymorphic variant <font color="#4bacc6">start with a backquote character</font>.
> Using polymorphic variants, we can rewrite `f`:

```ocaml
let f = function
  | 0 -> `Infinity
  | 1 -> `Finite 1
  | n -> `Finite (-n)
(* val f : int -> [> `Finite of int | `Infinity ] = <fun> *)
```
And `f` returns a value of type `'Finite` or `'Infinity`. The backquote is still there.

### Option

An option is actually a one-of type, it can be either having an element (e.g. an option `Some 22`, which has type `int option`) or being empty (an option `None`, which has type `'a option`). But `option` itself is not a type, it produce a new type `t option` from any type `t`.

```ocaml
let rec list_max = function
  | [] -> None
  | h :: t -> begin
      match list_max t with
        | None -> Some h
        | Some m -> Some (max h m)
      end
```

The type will be `val list_max : 'a list -> 'a option = <fun>`.
And the `begin` and `end` is equivalent to `()` in functionality.

> OCaml options force the programmer to include a branch in the pattern match for `None`, thus guaranteeing that the programmer thinks about the right thing to do when there’s nothing there. So we can think of options as a principled way of eliminating `null` from the language.
>
> - `None` is a value of type `'a option`.
> - `Some e` is an expression of type `t option` if `e : t`. If `e ==> v` then `Some e ==> Some v`

### Association lists

Map maps keys to values. In OCaml it can be trivially implemented in association list, which is a list of pairs with constant insertion time and linear lookup time.

```ocaml
let mymap : (string * int) list =
  [("Level 1", 128); ("Level 2", 192); ("Level 3", 256)];;
let insert k v lst = (k, v) :: lst;;
let rec lookup k = function
  | [] -> None
  | (k', v) :: t -> if k = k' then Some v else lookup k t;;
lookup "Level 1" mymap;;
(* - : int option = Some 128 *)
```

The standard library implements association lists with [List](https://ocaml.org/manual/5.4/api/List.html) module. Module names in OCaml use `CamelCase`, and function names use `snake_case`.

```ocaml
val fold_left : ('acc -> 'a -> 'acc) -> 'acc -> 'a list -> 'acc
val fold_right : ('a -> 'acc -> 'acc) -> 'a list -> 'acc -> 'acc
```

The `fold_left` is of type `List.fold_left : ('b -> 'a -> 'b) -> 'b -> 'a list -> 'b`.
so it takes three arguments `fold_left f init list`

- the first argument `f`: is a function, like the operator `+`, or the Cons. It takes the current accumulator of type `'b`, takes one element of type `'a`, do the operation to get a new accumulated value of type `'b`.
- the second argument is the initial accumulator
- the third argument is a list, we want to do the operation `f` from the left side of the list.
  `fold_left` is tail-recursive while the `fold_right` is not, because the head can be popped out from left side in $O(1)$ time.

## Quality of life in OCaml

### OUnit

Unit tests framework for OCaml: [OUnit](https://gildor478.github.io/ounit/ounit2/index.html)
Configure the dune project with `dune`

```
(executable
 (name test)
 (libraries ounit2))
```

Write a random `mycode.ml` file for invoking.

```ocaml
let ask_ds x = match x with
  | "good ds" -> "Thanks"
  | "sleepy ds" -> "OK"
  | "bad ds" -> "No"
  | _ -> failwith "Not in Dictionary"
```

Use the code an run a unit test. Each test case has a string giving it a descriptive name, and a function to run as the test case. In between is a custom operator `>::`. `>:::` is in between of the name of this test suite and the test cases.

```ocaml
open OUnit2
open Mycode

let tests = "test suit for asking ds" >::: [
  "say thanks" >:: (fun _ -> assert_equal "Thanks" (ask_ds "good ds"));
  "say no" >:: (fun _ -> assert_equal "No" (ask_ds "bad ds"));
  "say zzz" >:: (fun _ -> assert_equal "ZZZ" (ask_ds "sleepy ds") ~printer:(fun x -> x)); (* ~printer is an argument. Get `expected: ZZZ but got: OK` *)
  "say bye" >:: (fun _ -> assert_equal "Bye" (ask_ds "bye ds"))
]

let _ = run_test_tt_main tests
```

The output will be like

```
Error: test suit for asking ds:3:say bye.
Failure("Not in Dictionary")

Error: test suit for asking ds:2:say zzz.
expected: ZZZ but got: OK

```
