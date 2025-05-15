  package main

  import (
      "math/big"
      "syscall/js"
  )
//
//   // factorial calculates the factorial of n and returns it as a string.
//   func factorial(this js.Value, args []js.Value) interface{} {
//       n := uint32(args[0].Int())
//       result := big.NewInt(1)
//       for i := uint32(1); i <= n; i++ {
//           result.Mul(result, big.NewInt(int64(i)))
//       }
//       return result.String()
//   }
//
//   // fibonacci calculates the nth Fibonacci number and returns it as a string.
//   func fibonacci(this js.Value, args []js.Value) interface{} {
//       n := uint32(args[0].Int())
//       if n == 0 {
//           return "0"
//       }
//       a := big.NewInt(0)
//       b := big.NewInt(1)
//       for i := uint32(0); i < n; i++ {
//           a, b = b, new(big.Int).Add(a, b)
//       }
//       return a.String()
//   }
//
//  The current Go implementation can be improved by reducing memory allocations and simplifying operations.
// Let's rewrite main.go to pre-allocate big.Int instances and minimize method calls.

// Pre-allocate big.Int to reduce allocations
var (
    result = new(big.Int)
    a      = new(big.Int)
    b      = new(big.Int)
    temp   = new(big.Int)
)

func factorial(this js.Value, args []js.Value) interface{} {
    n := uint32(args[0].Int())

    result.SetInt64(1) // Reset result to 1
    for i := uint32(1); i <= n; i++ {
        temp.SetUint64(uint64(i))
        result.Mul(result, temp)
    }
    return result.String()
}

func fibonacci(this js.Value, args []js.Value) interface{} {
    n := uint32(args[0].Int())
    if n == 0 {
        return "0"
    }

    a.SetInt64(0)
    b.SetInt64(1)
    for i := uint32(0); i < n; i++ {
        temp.Set(a)      // Reuse temp for intermediate value
        a.Set(b)
        b.Add(temp, b)
    }
    return a.String()
}

  // registerFunctions exposes Go functions to JavaScript.
  func registerFunctions() {
      js.Global().Set("factorial", js.FuncOf(factorial))
      js.Global().Set("fibonacci", js.FuncOf(fibonacci))
      println("Go functions registered successfully")
  }

  func main() {
      // Register functions for JavaScript access
      registerFunctions()
      // Keep the Go program running
      select {}
  }




