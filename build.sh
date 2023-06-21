#!/bin/sh
DENO_VERSION="v1.34.2"
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=./deno-v1.34.2 sh -s v1.34.2
NO_COLOR=1 DENO_VERSION=v1.34.2  \
    ./deno-v1.34.2/bin/deno task build