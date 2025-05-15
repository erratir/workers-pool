# Workers Pool

## Project Overview

**Workers Pool** is a web application built with **Quasar** (Vue.js), **Vite**, and **Pinia**, showcasing the use of **Web Workers** for asynchronous task execution in a worker pool with task queuing. The application supports two types of workers:

1. **HTTP Worker**: Performs HTTP requests (GET/POST) to external APIs with basic authentication.
2. **Compute Worker**: Executes computational tasks (factorial and Fibonacci) in multiple implementations:
   - **JavaScript**: Native JS implementation.
   - **Rust**: WebAssembly compiled from Rust for high performance.
   - **Go**: WebAssembly compiled from Go.
   - **TinyGo**: WebAssembly compiled from TinyGo for lightweight execution.

The project provides a user interface to configure workers, execute tasks, view results, and analyze performance metrics for different worker types.

## Technology Stack

- **Quasar Framework**: Vue.js-based UI framework.
- **Vite**: Fast build tool and development server.
- **Pinia**: State management library.
- **Web Workers**: For asynchronous task execution in separate threads.
- **WebAssembly**: Rust, Go, and TinyGo for high-performance computations.
- **Rust + wasm-pack**: For compiling Rust to WebAssembly.
- **Go/TinyGo**: For compiling Go-based WebAssembly modules.

## Installation and Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **Rust** and **wasm-pack** (for Rust WebAssembly compilation)
- **Go** and **TinyGo** (for Go/TinyGo WebAssembly compilation)
- **NPM** or **Yarn** for dependency management

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd workers-pool
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

*Note*: Pre-compiled WebAssembly modules are included, so Rust, Go, or TinyGo compilation is optional unless modifying WASM code.

### Optional: Compiling WebAssembly Modules

#### Rust
1. Install Rust and wasm-pack:
   ```bash
   curl https://sh.rustup.rs -sSf | sh
   rustup target add wasm32-unknown-unknown
   cargo install wasm-pack
   ```
2. Build the Rust WASM module:
   ```bash
   cd factorial-rust-wasm
   wasm-pack build --target web
   ```
3. Copy `pkg/factorial_wasm.js` and `pkg/factorial_wasm_bg.wasm` to `src/workers/wasm/rust/`.

#### Go/TinyGo
1. Install Go and TinyGo:
   - Go: Follow [official instructions](https://go.dev/doc/install).
   - TinyGo: Follow [TinyGo installation](https://tinygo.org/getting-started/install/).
2. Build Go or TinyGo WASM module:
   ```bash
   cd factorial-go-wasm
   make wasm_exec_go.js       # Download  wasm_exec_go   
   make build                 # For Go
   #
   make wasm_exec_tinygo.js   # Download  wasm_exec_tinygo
   make build-tinygo          # For TinyGo
   ```
3. The Makefile copies the output to `src/workers/wasm/golang/`.

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
   or with Quasar CLI:
   ```bash
   quasar dev
   ```

2. Open the application at `http://localhost:9000` (port may vary).

## Usage

The application features three tabs for interacting with workers:

1. **HTTP**:
   - Input IP/URL, port, username, and password for HTTP requests.
   - Select method (GET/POST) and optionally provide JSON body for POST.
   - Choose worker type (`http` or `all`).
   - Click "Send Request" to execute and view results, with filtering and clearing options.

2. **Compute**:
   - Enter a number for computation (e.g., 1000).
   - Select task type (`factorial` or `fibonacci`) and worker type (`js`, `rust`, `go`, `tinygo`, or `all`).
   - Click "Run Computation" to execute and view results, including execution time and filtering options.

3. **Dashboard**:
   - Displays performance metrics: average execution time and task count for each worker type and task.
   - Shows HTTP request performance metrics.

### Worker Configuration

- Click "Worker Settings" to adjust the number of workers for each type (`http`, `js`, `rust`, `go`, `tinygo`).
- Minimum worker count is 1; values below this are adjusted with a warning.
- Setting more than 10 workers per type triggers a performance warning in the console.
- Save changes to apply the new configuration.

### Worker Details

- **HTTP Worker Details**: Shows total, free, busy workers, and queued tasks.
- **Compute Worker Details**: Includes counts for JS, Rust, Go, and TinyGo workers, plus total, free, busy, and queued tasks.

## Project Structure

- `src/pages/IndexPage.vue`: Main UI component with tabs and forms for worker interaction.
- `src/stores/workerStore.js`: Pinia store for managing worker state, results, and metrics.
- `src/workers/`:
   - `httpWorker.js`: HTTP request worker.
   - `jsComputeWorker.js`: JavaScript compute worker.
   - `rustComputeWorker.js`, `goComputeWorker.js`, `tinygoComputeWorker.js`: WebAssembly compute workers.
   - `workerManager.js`: Manages worker pools and task queues.
   - `wasm/`: Contains compiled WebAssembly modules for Rust, Go, and TinyGo.
- `factorial-rust-wasm/`: Rust project for WebAssembly compilation.
- `factorial-go-wasm/`: Go/TinyGo project for WebAssembly compilation.
- `README.md`: Project documentation.

## Notes

- **Performance**: Rust and Go/TinyGo WebAssembly workers typically outperform JavaScript for large computations, as shown in the Dashboard metrics.
- **Limitations**: HTTP workers require valid credentials and CORS-enabled APIs for browser requests.
- **Extensibility**: Add new worker types or tasks by updating `workerConfig` in `workerStore.js` and creating corresponding worker files.

