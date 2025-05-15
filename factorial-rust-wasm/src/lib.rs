use num_bigint::BigUint;
use num_traits::{One, Zero};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn factorial(n: u32) -> String {
    let mut result = BigUint::one();
    for i in 1..=n {
        result *= BigUint::from(i);
    }
    result.to_string()
}

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> String {
    if n == 0 {
        return BigUint::zero().to_string();
    }
    let mut a = BigUint::zero();
    let mut b = BigUint::one();
    for _ in 0..n {
        (a, b) = (b.clone(), a + b);
    }
    a.to_string()
}
