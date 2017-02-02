#!/bin/bash

# This is a simple wrapper script to make colors work in solarized
# and other color schemes that exhibit this error.
# See: https://github.com/mochajs/mocha/issues/802

mocha="./node_modules/.bin/mocha"
substitution='s/\x1b\[90m/\x1b[92m/g'

$mocha --harmony --es-staging -c --recursive test > >(perl -pe "$substitution") 2> >(perl -pe "$substitution" 1>&2)
