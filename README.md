Group Traits
============
[![Build Status](https://travis-ci.org/ZombieHippie/group-traits.svg?branch=master)](https://travis-ci.org/ZombieHippie/group-traits)

This is an algorithm which divides up objects in groups based on their similar traits.

## Metamorphic Testing

This project's goal is to demonstrate Metamorphic testing on this domain by modifying the test oracles provided in the `./test/cases` directory.

The gist of metamorphic testing, is that we modify the existing test oracles in way which are randomized in ways which have predictable consequences.
For example, if we have a group which is entirely single traits of `1`, then adding the trait `2` to one of the objects randomly, we should recieve the same output.
