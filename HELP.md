# Help my dist directories aren't getting created

Since we're using incremental builds if you delete the `dist`
dir but not the related `*.tsbuildinfo`, tsc will think that
there's nothing to be done and won't remake the files in dist.
Run `yarn clean` to fully clean everything and start from
scratch.
