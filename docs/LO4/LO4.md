# 4.1
There are no gaps I noticed in the unit testing for R1.
In R2, we do not test for "no part" spoilers, and so defects may exist in this area that are not checked. This was also implemented independently of the actual database routes - simply copying the "logic" over - and thus omits logic issues existent in the routes from outside factors. This limitation was due to time and is worth noting.
R3 is not a particularly thorough test of different loads, only a "worst example". An omission could be a particularly tricky combination - combined with the omissions in the actual combinatorial testing, these issues could compound to let nasty bugs unchecked through to production.
# 4.2
R1 & R2 should have coverage and hopefully run quickly - they'll be ran constantly so this matters.
R3 is only designed to test worst case scenario, and can take longer - it isn't ran as frequently and will take long by nature (due to Chrome's performance capturing).
# 4.3
R1 is mostly on target: however the test results mention the initial setup (of `Media`) takes almost 80ms. Thankfully, this is mainly due to all the necessary scaffolding being collated by `Chai` into this one test, and since the total suite takes 569ms, this is comfortably in my requirements on running fast - especially for such a high coverage suite. R2 is also incredibly fast.
R3 usually takes around 20 seconds to setup and record. This is within our target but admittedly this is due to it's generous nature (being a performance test).
# 4.4
The only test worth considering is R1. In the future, maybe some form of "preloading" the test environment could shave that 80ms down a fair bit, hopefully getting the whole test suite to under 500ms.