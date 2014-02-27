#!/usr/bin/env bash

# Rather than use an awkward submodule flow, I ripped the javascript files I needed from 

mkdir -p base/js/

wget https://raw.github.com/ipython/ipython/master/IPython/html/static/base/js/namespace.js -O base/js/namespace.js
wget https://raw.github.com/ipython/ipython/master/IPython/html/static/base/js/utils.js -O base/js/utils.js

mkdir -p services/kernels/js/

wget https://raw.github.com/ipython/ipython/master/IPython/html/static/services/kernels/js/comm.js -O services/kernels/js/comm.js
wget https://raw.github.com/ipython/ipython/master/IPython/html/static/services/kernels/js/kernel.js -O services/kernels/js/kernel.js
