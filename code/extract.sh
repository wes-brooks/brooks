#! /bin/sh
for i in "ls output-$1-*"; do
    tar -xf $i;
done

