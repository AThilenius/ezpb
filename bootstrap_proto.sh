#!/bin/sh
set -e

# Bootstrap Typescript generation
./bin/ezpb gen ts \
  --any-type \
  --bootstrap \
  --output src/gen/proto_gen_bootstrap.ts \
  --input protos/wlabs/ezpb/meta.proto

# Main core Typescript generation
./bin/ezpb gen ts \
  --any-type \
  --output src/gen/proto_gen.ts \
  --input protos/wlabs/ezpb/transport.proto \
  --input protos/wlabs/ezpb/meta.proto \
  --input proto/**/*.proto

# Test code Typescript generation
./bin/ezpb gen ts \
  --runtimeModule . \
  --output src/tests/gen/proto_gen.ts \
  --input src/tests/proto/**/*.proto
