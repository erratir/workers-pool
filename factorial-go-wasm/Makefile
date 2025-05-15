.PHONY: build serve

# Here we have two variants of the build target: one for the Go compiler and one
# for TinyGo. You can run either of them to build the WebAssembly binary.
# Each has their own wasm_exec.js file, so the right one has to be downloaded
# before buildling.

wasm_exec_go.js:
	wget https://raw.githubusercontent.com/golang/go/release-branch.go1.24/lib/wasm/wasm_exec.js -O wasm_exec_go.js
	touch $@
	cp $@ ../src/workers/wasm/golang/$@

wasm_exec_tinygo.js:
	wget https://raw.githubusercontent.com/tinygo-org/tinygo/release/targets/wasm_exec.js -O wasm_exec_tinygo.js
	touch $@
	cp $@ ../src/workers/wasm/golang/$@

build: wasm_exec_go.js
	GOOS=js GOARCH=wasm go build -o factorial_go_wasm.wasm main.go
	cp factorial_go_wasm.wasm ../src/workers/wasm/golang/factorial_go_wasm.wasm

build-tinygo: wasm_exec_tinygo.js
	GOOS=js GOARCH=wasm tinygo build -o factorial_tinygo_wasm.wasm main.go
	cp factorial_tinygo_wasm.wasm ../src/workers/wasm/golang/factorial_tinygo_wasm.wasm


